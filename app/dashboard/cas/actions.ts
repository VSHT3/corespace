"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createExperience(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string) || "";

  const { error } = await supabase.from("cas_experiences").insert({
    user_id: user.id,
    title,
    category,
    description,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/cas");
}

export async function updateExperience(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string) || "";
  const hours = parseFloat((formData.get("hours") as string) || "0");
  const status = formData.get("status") as string;
  const outcomesRaw = formData.getAll("learning_outcomes") as string[];

  const { error } = await supabase
    .from("cas_experiences")
    .update({ title, category, description, hours, status, learning_outcomes: outcomesRaw })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/cas");
  revalidatePath(`/dashboard/cas/${id}`);
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("cas_experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/cas");
}

export async function addReflection(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const experienceId = formData.get("experience_id") as string;
  const content = formData.get("content") as string;

  const { error } = await supabase.from("cas_reflections").insert({
    experience_id: experienceId,
    user_id: user.id,
    content,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/cas/${experienceId}`);
}
