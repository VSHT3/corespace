"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExhibition(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // IB students do the exhibition once — guard against multiple
  const { data: existing } = await supabase
    .from("tok_exhibitions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/dashboard/tok/${existing.id}`);
  }

  const title = (formData.get("title") as string)?.trim() || "Untitled Exhibition";
  const promptId = parseInt(formData.get("prompt_id") as string);

  const { data, error } = await supabase
    .from("tok_exhibitions")
    .insert({ user_id: user.id, title, prompt_id: promptId })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/dashboard/tok/${data.id}`);
}

export async function deleteExhibition(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("tok_exhibitions").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard/tok");
  revalidatePath("/dashboard/tok/exhibition");
  redirect("/dashboard/tok/exhibition");
}

export async function saveObject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const exhibitionId = formData.get("exhibition_id") as string;
  const objectId = formData.get("object_id") as string | null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const objectType = (formData.get("object_type") as string)?.trim();
  const position = parseInt(formData.get("position") as string);

  if (objectId) {
    await supabase
      .from("tok_objects")
      .update({ title, description, object_type: objectType })
      .eq("id", objectId);
  } else {
    // Guard: max 3 objects per exhibition
    const { count } = await supabase
      .from("tok_objects")
      .select("id", { count: "exact", head: true })
      .eq("exhibition_id", exhibitionId);

    if ((count ?? 0) >= 3) {
      return; // silently reject extra inserts
    }

    await supabase
      .from("tok_objects")
      .insert({ exhibition_id: exhibitionId, title, description, object_type: objectType, position });
  }

  revalidatePath(`/dashboard/tok/${exhibitionId}`);
}

export async function updateExhibitionTitle(id: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trimmed = title.trim();
  if (!trimmed) return;

  await supabase
    .from("tok_exhibitions")
    .update({ title: trimmed })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath(`/dashboard/tok/${id}`);
  revalidatePath("/dashboard/tok/exhibition");
}

export async function saveJustification(exhibitionId: string, objectId: string, justification: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("tok_objects")
    .update({ justification })
    .eq("id", objectId);

  revalidatePath(`/dashboard/tok/${exhibitionId}`);
}

export async function deleteObject(exhibitionId: string, objectId: string) {
  const supabase = await createClient();
  await supabase.from("tok_objects").delete().eq("id", objectId);
  revalidatePath(`/dashboard/tok/${exhibitionId}`);
}


