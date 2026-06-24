export type ParishSession = {
  userId: string;
  email: string;
  parishId: string;
  parishName: string;
  demo: boolean;
};

const DEMO_SESSION: ParishSession = {
  userId: "demo",
  email: "demo@ortodoxia.ro",
  parishId: "00000000-0000-0000-0000-000000000000",
  parishName: "Parohia Demo",
  demo: true
};

export async function getParishSession(client: any): Promise<ParishSession> {
  const { data: userData } = await client.auth.getUser();

  if (!userData?.user) {
    return DEMO_SESSION;
  }

  const email = userData.user.email ?? "";
  if (!email) {
    return DEMO_SESSION;
  }

  const { data: parish } = await client.from("parohii").select("id, nume").eq("email", email).maybeSingle();

  if (!parish) {
    return DEMO_SESSION;
  }

  return {
    userId: userData.user.id,
    email,
    parishId: parish.id,
    parishName: parish.nume,
    demo: false
  };
}
