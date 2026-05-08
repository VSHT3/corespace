"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExhibition(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

export async function duplicateExhibition(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch original exhibition + objects
  const { data: original } = await supabase
    .from("tok_exhibitions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!original) return;

  const { data: newEx } = await supabase
    .from("tok_exhibitions")
    .insert({ user_id: user.id, title: `${original.title} (copy)`, prompt_id: original.prompt_id })
    .select("id")
    .single();

  if (!newEx) return;

  const { data: objects } = await supabase
    .from("tok_objects")
    .select("*")
    .eq("exhibition_id", id);

  if (objects && objects.length > 0) {
    await supabase.from("tok_objects").insert(
      objects.map((o: { title: string; description: string | null; object_type: string | null; justification: string | null; position: number }) => ({
        exhibition_id: newEx.id,
        title: o.title,
        description: o.description,
        object_type: o.object_type,
        justification: o.justification,
        position: o.position,
      }))
    );
  }

  revalidatePath("/dashboard/tok/exhibition");
  redirect(`/dashboard/tok/${newEx.id}`);
}

export async function swapObjectPositions(exhibitionId: string, posA: number, posB: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: objects } = await supabase
    .from("tok_objects")
    .select("id, position")
    .eq("exhibition_id", exhibitionId)
    .in("position", [posA, posB]);

  if (!objects || objects.length < 2) return;

  const objA = objects.find((o: { id: string; position: number }) => o.position === posA);
  const objB = objects.find((o: { id: string; position: number }) => o.position === posB);

  if (!objA || !objB) return;

  await supabase.from("tok_objects").update({ position: posB }).eq("id", objA.id);
  await supabase.from("tok_objects").update({ position: posA }).eq("id", objB.id);

  revalidatePath(`/dashboard/tok/${exhibitionId}`);
}
