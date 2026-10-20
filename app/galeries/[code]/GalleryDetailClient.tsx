"use client";

import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase";

const photosBucket = "gallery-photos";
const galleryStatuses = ["Brouillon", "Prête", "Livrée"];

export type GalleryDetails = {
  client: string;
  contact?: string;
  photographer_message?: string;
  code: string;
  type: string;
  date: string;
  status: string;
  photos: number;
};

type GalleryPhoto = {
  name: string;
  path: string;
  publicUrl: string;
};

type GalleryImageProps = {
  alt: string;
  className: string;
  src: string;
  wrapperClassName: string;
};

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", active: false },
  { label: "Galeries", href: "/galeries", active: true },
  { label: "Photos", href: "/photos", active: false },
  { label: "Clients", href: "/clients", active: false },
  { label: "Réglages", href: "/reglages", active: false },
  { label: "Déconnexion", href: "/logout", active: false },
];

const sanitizeFileName = (fileName: string) =>
  fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const getGalleryAccessMessage = (clientName: string, galleryCode: string) =>
  `Bonjour ${clientName}, votre galerie PS23 Photography est prête. Code galerie : ${galleryCode}. Rendez-vous dans l’espace client pour consulter vos photos.`;

const getWhatsAppUrl = (contact: string, message: string) => {
  const trimmedContact = contact.trim();
  const encodedMessage = encodeURIComponent(message);
  const normalizedPhone = trimmedContact.replace(/[^\d+]/g, "");

  if (normalizedPhone.startsWith("+")) {
    return `https://wa.me/${normalizedPhone.replace("+", "")}?text=${encodedMessage}`;
  }

  if (normalizedPhone.startsWith("00")) {
    return `https://wa.me/${normalizedPhone.slice(2)}?text=${encodedMessage}`;
  }

  if (normalizedPhone.startsWith("0")) {
    return `https://wa.me/225${normalizedPhone}?text=${encodedMessage}`;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
};

function GalleryImage({
  alt,
  className,
  src,
  wrapperClassName,
}: GalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!isLoaded && (
        <div className="absolute inset-0 grid place-items-center bg-[#efe8f7]">
          <span
            aria-label={hasError ? "Image indisponible" : "Image en chargement"}
            className={`size-9 rounded-full border-2 border-[#d9c8f1] ${
              hasError
                ? "border-t-[#b42318]"
                : "animate-spin border-t-[#6f3de2]"
            }`}
            role="status"
          />
        </div>
      )}
      <img
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        src={src}
      />
    </div>
  );
}

export default function GalleryDetailClient({
  accessToken,
  code,
  initialGallery,
  photographerId,
}: {
  accessToken: string;
  code: string;
  initialGallery: GalleryDetails;
  photographerId: string;
}) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [galleryDetails, setGalleryDetails] = useState(initialGallery);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const galleryCode = galleryDetails.code || code;
  const canManagePhotos = Boolean(galleryDetails.code);
  const photoCount = photos.length;

  const sortedPhotos = useMemo(
    () => [...photos].sort((first, second) => second.name.localeCompare(first.name)),
    [photos],
  );
  const currentPhoto =
    activePhoto === null ? null : sortedPhotos[activePhoto] ?? null;

  useEffect(() => {
    const loadPhotos = async () => {
      if (!galleryCode) {
        setIsLoadingPhotos(false);
        return;
      }

      const { data, error } = await supabase.storage
        .from(photosBucket)
        .list(galleryCode, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        setFeedback(
          "Impossible de charger les photos. Vérifie que le bucket Supabase existe.",
        );
        setIsLoadingPhotos(false);
        return;
      }

      const loadedPhotos = (data ?? [])
        .filter((photo) => photo.name)
        .map((photo) => {
          const path = `${galleryCode}/${photo.name}`;
          const { data: publicData } = supabase.storage
            .from(photosBucket)
            .getPublicUrl(path);

          return {
            name: photo.name,
            path,
            publicUrl: publicData.publicUrl,
          };
        });

      setPhotos(loadedPhotos);
      setGalleryDetails((currentGallery) => ({
        ...currentGallery,
        photos: loadedPhotos.length,
      }));
      setIsLoadingPhotos(false);
    };

    loadPhotos();
  }, [galleryCode]);

  const updateGalleryPhotoCount = async (nextPhotoCount: number) => {
    setGalleryDetails((currentGallery) => ({
      ...currentGallery,
      photos: nextPhotoCount,
    }));

    const { error } = await supabase
      .from("galleries")
      .update({ photos: nextPhotoCount })
      .eq("code", galleryCode)
      .eq("photographer_id", photographerId);

    if (error) {
      setFeedback(
        "Les photos sont envoyées, mais le compteur n’a pas pu être mis à jour. Vérifie la policy UPDATE sur galleries.",
      );
      return false;
    }

    return true;
  };

  const uploadFiles = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      return;
    }

    if (!canManagePhotos) {
      setFeedback("Cette galerie est introuvable, impossible d’ajouter des photos.");
      return;
    }

    setIsUploading(true);
    setFeedback("");
    setUploadProgress({ current: 0, total: selectedFiles.length });

    const uploadedPhotos: GalleryPhoto[] = [];

    for (const [index, file] of selectedFiles.entries()) {
      setUploadProgress({ current: index + 1, total: selectedFiles.length });
      const fileName = `${Date.now()}-${index}-${sanitizeFileName(file.name)}`;
      const path = `${galleryCode}/${fileName}`;
      const { error } = await supabase.storage
        .from(photosBucket)
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        setFeedback(
          "Certaines photos n’ont pas été envoyées. Vérifie le bucket et les policies Supabase.",
        );
        continue;
      }

      const { data: publicData } = supabase.storage
        .from(photosBucket)
        .getPublicUrl(path);

      uploadedPhotos.push({
        name: fileName,
        path,
        publicUrl: publicData.publicUrl,
      });
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (uploadedPhotos.length > 0) {
      const nextPhotos = [...uploadedPhotos, ...photos];
      setPhotos(nextPhotos);
      const isPhotoCountUpdated = await updateGalleryPhotoCount(nextPhotos.length);

      if (isPhotoCountUpdated) {
        setFeedback(
          `${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? "s" : ""} ajoutée${uploadedPhotos.length > 1 ? "s" : ""}.`,
        );
      }
    }

    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);

    await uploadFiles(selectedFiles);

    input.value = "";
  };

  const handleDeletePhoto = async (photoToDelete: GalleryPhoto) => {
    const { error } = await supabase.storage
      .from(photosBucket)
      .remove([photoToDelete.path]);

    if (error) {
      setFeedback("La photo n’a pas pu être supprimée.");
      return;
    }

    const nextPhotos = photos.filter((photo) => photo.path !== photoToDelete.path);
    setPhotos(nextPhotos);
    const isPhotoCountUpdated = await updateGalleryPhotoCount(nextPhotos.length);

    if (isPhotoCountUpdated) {
      setFeedback("Photo supprimée.");
    }
  };

  const showPreviousPhoto = () => {
    setActivePhoto((currentPhotoIndex) =>
      currentPhotoIndex === null
        ? 0
        : (currentPhotoIndex - 1 + sortedPhotos.length) % sortedPhotos.length,
    );
  };

  const showNextPhoto = () => {
    setActivePhoto((currentPhotoIndex) =>
      currentPhotoIndex === null
        ? 0
        : (currentPhotoIndex + 1) % sortedPhotos.length,
    );
  };

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!canManagePhotos) {
      setFeedback("Cette galerie est introuvable, impossible de changer le statut.");
      return;
    }

    setIsUpdatingStatus(true);
    setFeedback("");

    const { error } = await supabase
      .from("galleries")
      .update({ status: nextStatus })
      .eq("code", galleryCode)
      .eq("photographer_id", photographerId);

    setIsUpdatingStatus(false);

    if (error) {
      setFeedback("Le statut n’a pas pu être mis à jour. Vérifie la policy UPDATE sur galleries.");
      return;
    }

    setGalleryDetails((currentGallery) => ({
      ...currentGallery,
      status: nextStatus,
    }));
    setFeedback(`Statut mis à jour : ${nextStatus}.`);
  };

  const handleSendCode = async () => {
    const contact = galleryDetails.contact?.trim() ?? "";
    const message = getGalleryAccessMessage(galleryDetails.client, galleryCode);

    try {
      await navigator.clipboard.writeText(message);
    } catch {
      // Clipboard can fail in some browser contexts; sending still works below.
    }

    if (!contact) {
      setFeedback("Message copié. Ajoute un contact client pour l’envoyer directement.");
      return;
    }

    if (contact.includes("@")) {
      const subject = encodeURIComponent("Votre code galerie PS23 Photography");
      const body = encodeURIComponent(message);

      window.location.href = `mailto:${contact}?subject=${subject}&body=${body}`;
      setFeedback("Email préparé avec le code galerie.");
      return;
    }

    window.open(getWhatsAppUrl(contact, message), "_blank", "noopener,noreferrer");
    setFeedback("Message WhatsApp préparé avec le code galerie.");
  };

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-[#191025]">
      <section className="min-h-screen">
        <div className="min-h-screen bg-[#f7f5fb]">
          <div className="grid min-h-screen lg:grid-cols-[180px_1fr]">
            <aside className="bg-[#171020] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-[#6f3de2] text-sm font-black">
                  PS
                </div>
                <div>
                  <p className="text-sm font-black">PS23</p>
                  <p className="text-xs text-white/45">Gestion</p>
                </div>
              </div>

              <nav className="mt-10 grid gap-2 text-sm font-bold">
                {sidebarLinks.map((link) => (
                  link.href === "/logout" ? (
                    <form action="/logout" method="post" key={link.label}>
                      <button className="w-full rounded-xl px-3 py-2 text-left text-white/55 transition hover:bg-white/10 hover:text-white" type="submit">{link.label}</button>
                    </form>
                  ) : (
                    <Link
                      className={`rounded-xl px-3 py-2 transition ${
                        link.active
                          ? "bg-white text-[#171020]"
                          : "text-white/55 hover:bg-white/10 hover:text-white"
                      }`}
                      href={link.href}
                      key={link.label}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </nav>
            </aside>

            <section className="min-w-0 p-5 sm:p-7">
              <Link
                className="inline-flex rounded-full border border-[#e8def5] bg-white px-4 py-2 text-sm font-black text-[#6f3de2]"
                href="/galeries"
              >
                ← Retour aux galeries
              </Link>

              <header className="mt-5 grid gap-5 rounded-2xl bg-gradient-to-br from-[#6f3de2] to-[#9c6cff] p-5 text-white shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-white/65">
                    Galerie client
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    {galleryDetails.client}
                  </h1>
                  <p className="mt-2 text-sm text-white/75">
                    Code demandé : {galleryCode}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <input
                    accept="image/*"
                    className="hidden"
                    disabled={!canManagePhotos || isUploading}
                    multiple
                    onChange={handleUpload}
                    ref={inputRef}
                    type="file"
                  />
                  <button
                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#6f3de2] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canManagePhotos || isUploading}
                    onClick={() => inputRef.current?.click()}
                    type="button"
                  >
                    {isUploading
                      ? `Envoi ${uploadProgress.current}/${uploadProgress.total}`
                      : "Ajouter des photos"}
                  </button>
                  <button
                    className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white"
                    onClick={handleSendCode}
                    type="button"
                  >
                    Envoyer le code
                  </button>
                </div>
              </header>

              {feedback && (
                <p className="mt-4 rounded-2xl border border-[#e8def5] bg-white px-4 py-3 text-sm font-bold text-[#6f3de2]">
                  {feedback}
                </p>
              )}

              <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Type
                  </p>
                  <p className="mt-2 font-black">{galleryDetails.type}</p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Date
                  </p>
                  <p className="mt-2 font-black">{galleryDetails.date}</p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Photos
                  </p>
                  <p className="mt-2 font-black">{photoCount}</p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Statut
                  </p>
                  <p className="mt-2 font-black text-[#6f3de2]">
                    {galleryDetails.status}
                  </p>
                </article>
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
                <div className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black">
                        Photos de la galerie
                      </h2>
                      <p className="mt-1 text-sm text-[#766985]">
                        Ajoutez une ou plusieurs images en une seule sélection.
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-[#f1e9ff] px-3 py-1 text-xs font-black text-[#6f3de2]">
                      {photoCount} photo{photoCount > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {isLoadingPhotos && (
                      <p className="border border-dashed border-[#e8def5] bg-[#fbf8ff] p-5 text-sm font-bold text-[#766985] sm:col-span-2 xl:col-span-3">
                        Chargement des photos...
                      </p>
                    )}

                    {!isLoadingPhotos && sortedPhotos.length === 0 && (
                      <p className="border border-dashed border-[#e8def5] bg-[#fbf8ff] p-5 text-sm font-bold text-[#766985] sm:col-span-2 xl:col-span-3">
                        Aucune photo dans cette galerie pour le moment.
                      </p>
                    )}

                    {!isLoadingPhotos &&
                      sortedPhotos.map((photo, index) => (
                        <article
                          className="overflow-hidden border border-[#eee6f7] bg-[#fbf8ff] shadow-sm"
                          key={photo.path}
                        >
                          <button
                            aria-label={`Agrandir ${photo.name}`}
                            className="w-full bg-[#efe8f7]"
                            onClick={() => setActivePhoto(index)}
                            type="button"
                          >
                            <GalleryImage
                              alt="Photo de la galerie"
                              className="h-full w-full object-cover"
                              wrapperClassName="aspect-square"
                              src={photo.publicUrl}
                            />
                          </button>
                          <div className="flex items-center justify-between gap-3 p-3">
                            <span className="truncate text-xs font-bold text-[#766985]">
                              {photo.name}
                            </span>
                            <button
                              className="border border-[#ffd5d2] bg-[#fff0f0] px-3 py-1 text-xs font-bold text-[#b42318]"
                              onClick={() => handleDeletePhoto(photo)}
                              type="button"
                            >
                              Supprimer
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>

                <aside className="grid gap-5">
                  <section className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black">Statut de galerie</h2>
                    <p className="mt-2 text-sm leading-6 text-[#766985]">
                      Changez l’étape visible dans l’espace client.
                    </p>
                    <div className="mt-4 grid gap-2">
                      {galleryStatuses.map((status) => {
                        const isActiveStatus = galleryDetails.status === status;

                        return (
                          <button
                            className={`rounded-full px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              isActiveStatus
                                ? "bg-[#6f3de2] text-white"
                                : "bg-[#f1e9ff] text-[#6f3de2] hover:bg-[#e7dbff]"
                            }`}
                            disabled={isUpdatingStatus || isActiveStatus}
                            key={status}
                            onClick={() => handleUpdateStatus(status)}
                            type="button"
                          >
                            {isActiveStatus ? `${status} actuel` : `Passer en ${status}`}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black">Accès client</h2>
                    <div className="mt-4 grid gap-3 text-sm">
                      <p className="flex justify-between gap-4">
                        <span className="text-[#766985]">Code</span>
                        <span className="font-mono text-xs font-black">
                          {galleryCode}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-[#766985]">Client</span>
                        <span className="font-black">
                          {galleryDetails.client}
                        </span>
                      </p>
                      {galleryDetails.contact && (
                        <p className="flex justify-between gap-4">
                          <span className="text-[#766985]">Contact</span>
                          <span className="font-black">
                            {galleryDetails.contact}
                          </span>
                        </p>
                      )}
                      {galleryDetails.photographer_message && (
                        <div className="rounded-2xl bg-[#fbf8ff] p-4">
                          <p className="text-xs font-black uppercase text-[#6f3de2]">
                            Message
                          </p>
                          <p className="mt-2 leading-6 text-[#766985]">
                            {galleryDetails.photographer_message}
                          </p>
                        </div>
                      )}
                      <p className="flex justify-between gap-4">
                        <span className="text-[#766985]">Statut</span>
                        <span className="font-black text-[#6f3de2]">
                          {galleryDetails.status}
                        </span>
                      </p>
                    </div>
                  </section>
                </aside>
              </section>
            </section>
          </div>
        </div>
      </section>

      {currentPhoto && activePhoto !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#12091f]/90 p-4">
          <button
            aria-label="Fermer l’image"
            className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-black text-[#211332]"
            onClick={() => setActivePhoto(null)}
            type="button"
          >
            Fermer
          </button>

          <button
            aria-label="Photo précédente"
            className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-[#6f3de2] sm:flex"
            onClick={showPreviousPhoto}
            type="button"
          >
            ‹
          </button>

          <div className="w-full max-w-5xl">
            <GalleryImage
              alt="Photo de la galerie agrandie"
              className="h-full w-full object-contain"
              key={currentPhoto.path}
              src={currentPhoto.publicUrl}
              wrapperClassName="h-[72vh] bg-black"
            />
            <div className="flex items-center justify-between gap-4 bg-white px-4 py-3">
              <p className="truncate text-sm font-black text-[#211332]">
                {currentPhoto.name}
              </p>
              <p className="shrink-0 text-sm font-bold text-[#6f3de2]">
                {activePhoto + 1} / {sortedPhotos.length}
              </p>
            </div>
          </div>

          <button
            aria-label="Photo suivante"
            className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-[#6f3de2] sm:flex"
            onClick={showNextPhoto}
            type="button"
          >
            ›
          </button>

          <div className="mt-4 flex gap-3 sm:hidden">
            <button
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#6f3de2]"
              onClick={showPreviousPhoto}
              type="button"
            >
              Précédente
            </button>
            <button
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#6f3de2]"
              onClick={showNextPhoto}
              type="button"
            >
              Suivante
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
