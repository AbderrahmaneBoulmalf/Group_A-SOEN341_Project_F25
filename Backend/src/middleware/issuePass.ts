import { type Request, type Response } from "express";
import { randomUUID } from "crypto";
import axios from "axios";

//Browser compatibility styff
function fallbackRandomId() {
  return (
    "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  );
}

export async function issuePass(req: Request, res: Response) {
  const event_id = Number(req.body.eventId);
  const user_id = Number((req as any).session?.userId);

  if (!Number.isInteger(event_id) || !Number.isInteger(user_id)) {
    return res.status(400).json({ error: "bad_input" });
  }

  try {
    const response = await axios.get(
      "http://localhost:8787/internal/getPasses",
      {
        params: { user_id, event_id },
        validateStatus: () => true,
      }
    );
    console.log("[issuePass] getPasses ->", response.status, response.data, {
      user_id,
      event_id,
    });

    switch (response.status) {
      case 200: {
        // existing pass found
        return res.status(200).json({ passId: response.data.pass });
      }
      case 404:
      case 410:
        // no reusable pass; fall through to create
        break;
      default: {
        console.error("getPasses unexpected:", response.status, response.data);
        return res
          .status(502)
          .json({ error: "upstream_error_get", status: response.status });
      }
    }

    // Create new pass
    const passId =
      typeof randomUUID === "function" ? randomUUID() : fallbackRandomId();

    const postResp = await axios.post(
      "http://localhost:8787/internal/passes",
      { passKey: passId, user_id, event_id },
      { validateStatus: () => true }
    );

    if (postResp.status !== 201 && postResp.status !== 200) {
      console.error("insert pass unexpected:", postResp.status, postResp.data);
      return res
        .status(502)
        .json({ error: "upstream_error_post", status: postResp.status });
    }

    return res.status(201).json({ passId });
  } catch (err: any) {
    console.error(
      "issue pass error:",
      err?.response?.data ?? err?.message ?? err
    );
    return res.status(500).json({ error: "internal_error" });
  }

  //get eventId from frontend
  //search database for existing pass for userId and eventId
  //if status = 200 return passId

  //if status = 404 generate new passId

  //read userId from the session

  //generate passId

  //add to database later
}

export default issuePass;
