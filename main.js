import { execSync } from "child_process";
import inquirer from "inquirer";

const BULLET = "º";
const CALS = process.env.ZOOM_LAUNCHER_CALS;
const ZOOM_URL = process.env.ZOOM_LAUNCHER_URL;

if (!ZOOM_URL) {
  console.error("Please set ZOOM_LAUNCHER_URL.");
  process.exit(1);
}

const search = (string, regex) => {
  const match = string.match(regex) || [];
  return (match[1] || "").trim();
};

(async function() {
  const output = execSync(
    `icalBuddy --bullet "${BULLET}" ${
      CALS ? `--includeCals "${CALS}"` : ""
    } eventsToday`
  );

  let events = output
    .toString()
    .split(BULLET)
    .slice(1);

  events = events.map(e => {
    const title = search(e, `^(.*) \\(.*\\)`);
    const id = search(e, `${ZOOM_URL}/./(\\w+)`);
    const date = search(e, `\n(.*)\n$`);
    return { id, date, title };
  });

  const response = await inquirer.prompt({
    type: "list",
    name: "meeting",
    message: "Which meeting would you like to join?",
    choices: events.map(e => ({
      name: `${e.title} (${e.date})`,
      value: e.id
    }))
  });

  execSync(
    `open "zoommtg://invisionapp.zoom.us/join?action=join&confno=${
      response.meeting
    }"`
  );
})();
