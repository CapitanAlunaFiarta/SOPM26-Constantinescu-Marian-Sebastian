import {
  generateOccupiedSeats,
  createTicketId,
  signTicketFields,
  verifyTicketParams,
  mergeSeatLists,
  PROTECTED_SEATS
} from "./tickets";

describe("generateOccupiedSeats", () => {
  it("este determinist pentru aceeași proiecție", () => {
    expect(generateOccupiedSeats("1_IMAX_Luni_19:00")).toEqual(
      generateOccupiedSeats("1_IMAX_Luni_19:00")
    );
  });

  it("diferă între proiecții diferite", () => {
    const keys = ["1_IMAX_A_12:00", "1_IMAX_A_14:00", "2_4DX_B_19:00", "3_VIP_C_21:30", "4_IMAX_D_16:30"];
    const distinct = new Set(keys.map((k) => generateOccupiedSeats(k).join(",")));
    expect(distinct.size).toBeGreaterThan(1);
    expect(distinct.size).toBe(keys.length);
  });

  it("păstrează libere locurile pentru AI Sweet-Spot și rămâne în limitele sălii", () => {
    for (let i = 0; i < 60; i++) {
      const seats = generateOccupiedSeats(`slot-${i}`);
      PROTECTED_SEATS.forEach((p) => expect(seats).not.toContain(p));
      expect(seats.length).toBeGreaterThanOrEqual(10);
      expect(seats.length).toBeLessThanOrEqual(18);
      expect(new Set(seats).size).toBe(seats.length);
      seats.forEach((s) => expect(s).toMatch(/^R[1-7]L([1-9]|1[0-2])$/));
    }
  });
});

describe("mergeSeatLists", () => {
  it("elimină duplicatele și sortează după rând și coloană", () => {
    expect(mergeSeatLists(["R2L1", "R1L10"], ["R1L2", "R2L1"])).toEqual(["R1L2", "R1L10", "R2L1"]);
  });
});

describe("createTicketId", () => {
  it("generează id-uri unice cu prefix NIII7", () => {
    const ids = new Set(Array.from({ length: 200 }, () => createTicketId()));
    expect(ids.size).toBe(200);
    ids.forEach((id) => expect(id).toMatch(/^NIII7-[0-9A-Z]+-[A-Z2-9]{5}$/));
  });
});

describe("semnătura biletului", () => {
  const fields = {
    id: "NIII7-ABC-12345",
    film: "Inception",
    data: "Duminică, 29 Noiembrie 2026",
    ora: "19:00",
    locuri: "R4L6, R4L7",
    format: "4DX"
  };

  it("este stabilă și se schimbă dacă se modifică orice câmp", () => {
    const sig = signTicketFields(fields);
    expect(signTicketFields({ ...fields })).toBe(sig);
    Object.keys(fields).forEach((key) => {
      expect(signTicketFields({ ...fields, [key]: `${fields[key]}x` })).not.toBe(sig);
    });
  });

  it("verifyTicketParams acceptă doar parametri semnați corect", () => {
    const params = new URLSearchParams({ ...fields, sig: signTicketFields(fields) });
    expect(verifyTicketParams(params).valid).toBe(true);

    params.set("locuri", "R1L1");
    expect(verifyTicketParams(params)).toMatchObject({ valid: false, reason: "tampered" });

    params.delete("sig");
    expect(verifyTicketParams(params)).toMatchObject({ valid: false, reason: "unsigned" });

    expect(verifyTicketParams(new URLSearchParams())).toMatchObject({ valid: false, reason: "missing" });
  });
});
