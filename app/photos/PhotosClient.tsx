"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const publicPhotosBucket = "public-gallery";
const photoCategories = ["Shooting", "Cérémonie", "Marque", "Conférence"];

type PublicPhoto = {
  id: number;
  title: string;
  category: string;
  storage_path: string;
  public_url: string;
  created_at?: string;
};

const initialForm = {
  category: "Shooting",
  title: "",
};

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", active: false },
  { label: "Galeries", href: "/galeries", active: false },
  { label: "Photos", href: "/photos", active: true },
  { label: "Clients", href: "/clients", active: false },
  { label: "Réglages", href: "/dashboard", active: false },
];

const sanitizeFileName = (fileName: string) =>
  fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

export function PhotosClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<PublicPhoto[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const filteredPhotos = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return photos;
    }

    return photos.filter((photo) =>
      `${photo.title} ${photo.category}`.toLowerCase().includes(normalizedSearch),
    );
  }, [photos, search]);
  const currentPhoto =
    activePhoto === null ? null : filteredPhotos[activePhoto] ?? null;

  useEffect(() => {
    const loadPhotos = async () => {
      const { data, error } = await supabase
        .from("public_photos")
        .select("id, title, category, storage_path, public_url, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setFeedback(
          "Impossible de charger les photos publiques. Vérifie la table public_photos.",
        );
      } else {
        setPhotos((data as PublicPhoto[] | null) ?? []);
      }

      setIsLoading(false);
    };

    loadPhotos();
  }, []);

  const showPreviousPhoto = () => {
    setActivePhoto((current) =>
      current === null
        ? 0
        : (current - 1 + filteredPhotos.length) % filteredPhotos.length,
    );
  };

  const showNextPhoto = () => {
    setActivePhoto((current) =>
      current === null ? 0 : (current + 1) % filteredPhotos.length,
    );
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(event.target.files ?? []));
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      setFeedback("Choisis au moins une photo à importer.");
      return;
    }

    setIsUploading(true);
    setFeedback("");

    const uploadedPhotos: PublicPhoto[] = [];

    for (const [index, file] of selectedFiles.entries()) {
      const fileName = `${Date.now()}-${index}-${sanitizeFileName(file.name)}`;
      const path = `${form.category}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from(publicPhotosBucket)
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setFeedback(
          "Certaines photos n’ont pas été importées. Vérifie le bucket public-gallery et ses policies.",
        );
        continue;
      }

      const { data: publicData } = supabase.storage
        .from(publicPhotosBucket)
        .getPublicUrl(path);
      const title =
        selectedFiles.length === 1
          ? form.title || file.name
          : `${form.title || form.category} ${index + 1}`;
      const photoRecord = {
        id: Date.now() + index,
        title,
        category: form.category,
        storage_path: path,
        public_url: publicData.publicUrl,
      };
      const { data, error: insertError } = await supabase
        .from("public_photos")
        .insert(photoRecord)
        .select("id, title, category, storage_path, public_url, created_at")
        .single();

      if (insertError) {
        setFeedback(
          "La photo a été envoyée, mais ses informations n’ont pas été enregistrées. Vérifie la table public_photos.",
        );
        continue;
      }

      uploadedPhotos.push(data as PublicPhoto);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (uploadedPhotos.length > 0) {
      setPhotos((currentPhotos) => [...uploadedPhotos, ...currentPhotos]);
      setFeedback(
        `${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? "s" : ""} importée${uploadedPhotos.length > 1 ? "s" : ""}.`,
      );
      setForm(initialForm);
      setSelectedFiles([]);
      setIsImportOpen(false);
    }

    setIsUploading(false);
  };

  const handleDeletePhoto = async (photoToDelete: PublicPhoto) => {
    const { error: removeError } = await supabase.storage
      .from(publicPhotosBucket)
      .remove([photoToDelete.storage_path]);

    if (removeError) {
      setFeedback("La photo n’a pas pu être supprimée du stockage.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("public_photos")
      .delete()
      .eq("id", photoToDelete.id);

    if (deleteError) {
      setFeedback("La photo a été retirée du stockage, mais pas de la table.");
      return;
    }

    setPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.id !== photoToDelete.id),
    );
    setFeedback("Photo supprimée.");
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
                ))}
              </nav>
            </aside>

            <section className="min-w-0 p-5 sm:p-7">
              <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#6f3de2]">
                    Photos publiques
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    Galerie publique des réalisations.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766985]">
                    Importez et organisez les images qui apparaîtront dans la
                    galerie complète du site.
                  </p>
                </div>

                <button
                  className="w-fit rounded-full bg-[#6f3de2] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#6f3de2]/25"
                  onClick={() => setIsImportOpen((currentValue) => !currentValue)}
                  type="button"
                >
                  {isImportOpen ? "Fermer" : "Importer des photos"}
                </button>
              </header>

              {feedback && (
                <p className="mt-4 rounded-2xl border border-[#e8def5] bg-white px-4 py-3 text-sm font-bold text-[#6f3de2]">
                  {feedback}
                </p>
              )}

              {isImportOpen && (
                <section className="mt-6 rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#6f3de2]">
                    Nouvelle publication
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Importer des photos publiques
                  </h2>

                  <form
                    className="mt-5 grid gap-4 lg:grid-cols-3"
                    onSubmit={handleUpload}
                  >
                    <label className="grid gap-2 text-sm font-bold">
                      Catégorie *
                      <select
                        className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 font-medium outline-none focus:border-[#6f3de2]"
                        onChange={(event) =>
                          setForm({ ...form, category: event.target.value })
                        }
                        required
                        value={form.category}
                      >
                        {photoCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-bold">
                      Titre
                      <input
                        className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 font-medium outline-none focus:border-[#6f3de2]"
                        onChange={(event) =>
                          setForm({ ...form, title: event.target.value })
                        }
                        placeholder="Ex : Mariage civil"
                        type="text"
                        value={form.title}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold">
                      Photos *
                      <input
                        accept="image/*"
                        className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 font-medium outline-none focus:border-[#6f3de2]"
                        multiple
                        onChange={handleFileSelection}
                        ref={fileInputRef}
                        required
                        type="file"
                      />
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row lg:col-span-3">
                      <button
                        className="rounded-full bg-[#6f3de2] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isUploading}
                        type="submit"
                      >
                        {isUploading ? "Import en cours..." : "Publier les photos"}
                      </button>
                      <button
                        className="rounded-full border border-[#e8def5] px-5 py-3 text-sm font-bold text-[#6f3de2] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isUploading}
                        onClick={() => {
                          setForm(initialForm);
                          setIsImportOpen(false);
                          setSelectedFiles([]);
                        }}
                        type="button"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_280px]">
                <div className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-black">Photos publiées</h2>
                      <p className="mt-1 text-sm text-[#766985]">
                        Cliquez sur une photo pour l’agrandir et faire défiler.
                      </p>
                    </div>
                    <input
                      className="w-full rounded-full border border-[#e8def5] bg-[#fbf8ff] px-4 py-2 text-sm outline-none focus:border-[#6f3de2] sm:w-72"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Rechercher une photo"
                      type="search"
                      value={search}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {isLoading && (
                      <p className="rounded-2xl border border-dashed border-[#e8def5] bg-[#fbf8ff] p-5 text-sm font-bold text-[#766985] sm:col-span-2 xl:col-span-3">
                        Chargement des photos...
                      </p>
                    )}

                    {!isLoading && filteredPhotos.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-[#e8def5] bg-[#fbf8ff] p-5 text-sm font-bold text-[#766985] sm:col-span-2 xl:col-span-3">
                        Aucune photo publiée pour le moment.
                      </p>
                    )}

                    {!isLoading &&
                      filteredPhotos.map((photo, index) => (
                        <article
                          className="grid overflow-hidden border border-[#eee6f7] bg-white shadow-sm"
                          key={photo.id}
                        >
                          <button
                            aria-label={`Voir ${photo.title} en grand`}
                            className="aspect-square bg-[#f3eef9]"
                            onClick={() => setActivePhoto(index)}
                            type="button"
                          >
                            <img
                              alt={photo.title}
                              className="h-full w-full object-cover"
                              src={photo.public_url}
                            />
                          </button>
                          <div className="grid gap-3 border-t border-[#eee6f7] p-3">
                            <div className="min-h-12">
                              <p className="text-sm font-black leading-5">
                                {photo.title}
                              </p>
                              <p className="mt-1 text-xs font-bold text-[#6f3de2]">
                                {photo.category}
                              </p>
                            </div>
                            <button
                              className="border border-[#ffd5d2] bg-[#fff0f0] px-3 py-2 text-xs font-bold text-[#b42318]"
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
                  <section className="rounded-2xl bg-gradient-to-br from-[#6f3de2] to-[#9c6cff] p-5 text-white shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-white/65">
                      Aperçu
                    </p>
                    <p className="mt-4 text-4xl font-black">{photos.length}</p>
                    <p className="mt-2 text-sm font-medium text-white/75">
                      photos publiées.
                    </p>
                  </section>

                  <section className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black">Catégories</h2>
                    <div className="mt-4 grid gap-2">
                      {photoCategories.map((category) => (
                        <p
                          className="flex justify-between gap-3 text-sm font-bold text-[#766985]"
                          key={category}
                        >
                          <span>{category}</span>
                          <span>
                            {
                              photos.filter((photo) => photo.category === category)
                                .length
                            }
                          </span>
                        </p>
                      ))}
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
            <div className="h-[72vh] bg-black">
              <img
                alt={currentPhoto.title}
                className="h-full w-full object-contain"
                src={currentPhoto.public_url}
              />
            </div>
            <div className="flex items-center justify-between bg-white px-4 py-3">
              <div>
                <p className="font-black">{currentPhoto.title}</p>
                <p className="text-sm text-[#766985]">{currentPhoto.category}</p>
              </div>
              <p className="text-sm font-bold text-[#6f3de2]">
                {activePhoto + 1} / {filteredPhotos.length}
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
