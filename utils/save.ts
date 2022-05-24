import { History } from "../types";

class SaveManagement {
  static load(expectedTitle: string): History | null {
    const data = localStorage.getItem("save");
    if (!data) {
      return null;
    }

    const { history, title } = JSON.parse(data);
    if (!history || !title || title !== expectedTitle) {
      SaveManagement.clear();
      return null;
    }

    return history;
  }

  static save(title: string, history: History): void {
    const data = {
      title,
      history,
    };
    const json = JSON.stringify(data);
    localStorage.setItem("save", json);
  }

  static clear(): void {
    localStorage.removeItem("save");
  }
}

export default SaveManagement;
