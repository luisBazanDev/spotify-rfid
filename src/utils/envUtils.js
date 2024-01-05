import * as fs from "fs";

export function updateEnvValue(variableName, newValue) {
  const envPath = ".env";

  const content = fs.readFileSync(envPath, "utf-8");

  const newContent = content.replace(
    new RegExp(`${variableName}=.+`),
    `${variableName}=${newValue}`
  );

  fs.writeFileSync(envPath, newContent, "utf-8");
}
