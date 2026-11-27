import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyTicketParams } from "../utils/tickets";

const INVALID_MESSAGES = {
  missing: "Acest cod QR nu conține toate datele necesare unui bilet Cinema NIII7.",
  unsigned: "Codul QR nu are semnătura de securitate a biletului.",
  tampered: "Datele din cod nu corespund semnăturii biletului. Codul a fost modificat sau este fals."
};

export default function ValidateTicketPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const result = verifyTicketParams(searchParams);
  const { id, film, data, ora, locuri, format } = result.fields;

  return (
    <main className="valid-page-wrap">
      <div className={`valid-box ${result.valid ? "" : "invalid"}`}>
        {result.valid ? (
          <>
            <div className="valid-icon" aria-hidden="true">✅</div>
            <h1>BILET VALID — ACCES PERMIS</h1>
            <div className="valid-details">
              <p>
                BILET: <span className="valid-highlight">{id}</span>
              </p>
              <p>
                FILM: <span className="valid-highlight">{film}</span>
              </p>
              <p>
                FORMAT SALĂ: <span className="valid-highlight">{format || "IMAX"}</span>
              </p>
              <p>
                DATA: <span className="valid-highlight">{data}</span>
              </p>
              <p>
                ORA: <span className="valid-highlight">{ora}</span>
              </p>
              <div className="valid-seats-pill">LOCURI: {locuri}</div>
            </div>
          </>
        ) : (
          <>
            <div className="valid-icon" aria-hidden="true">❌</div>
            <h1>BILET INVALID</h1>
            <p className="valid-details">
              {INVALID_MESSAGES[result.reason] ||
                "Acest cod QR nu conține date valide sau nu figurează în sistemul Cinema NIII7."}
            </p>
          </>
        )}

        <button
          type="button"
          className="btn-cancel"
          style={{ marginTop: "24px", width: "100%" }}
          onClick={() => navigate("/")}
        >
          Înapoi la Cinema NIII7
        </button>
      </div>
    </main>
  );
}
