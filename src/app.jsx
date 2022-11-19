import { useState } from "preact/hooks";
import preactLogo from "./assets/preact.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./app.css";

export function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [url, setUrl] = useState("");

  const greet = async () => {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    try {
      await invoke("download_video", { url });
      console.log("downloaded");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div class="container">
      <div class="row">
        <div>
          <input
            id="url-input"
            onInput={(e) => setUrl(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="button" onClick={() => greet()}>
            Greet
          </button>
        </div>
      </div>
      <p>{greetMsg}</p>
    </div>
  );
}
