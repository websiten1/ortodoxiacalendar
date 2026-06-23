export type ParishSession = {
  userId: string;
  email: string;
  parishId: string;
  parishName: string;
};

export async function getParishSession(client: any): Promise<ParishSession> {
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Nu ești autentificat.");
  }

  const email = userData.user.email ?? "";

  if (!email) {
    throw new Error("Contul autentificat nu are email.");
  }

  const { data: parish, error: parishError } = await client
    .from("parohii")
    .select("id, nume")
    .eq("email", email)
    .maybeSingle();

  if (parishError || !parish) {
    throw new Error("Nu am găsit parohia asociată contului.");
  }

  return {
    userId: userData.user.id,
    email,
    parishId: parish.id,
    parishName: parish.nume
  };
}
