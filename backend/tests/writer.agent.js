import { writerAgent } from "../src/agents/writer.agent.js";

const main = async () => {
  const existingContent = "";
  const newPoints = ["Created a dedicated service for authentication (authService) separating business logic from controller logic.",
      "Introduced route definitions for authentication in auth.routes.js."];

  const result = await writerAgent({ existingContent, newPoints });

  console.log(result);
};

main();