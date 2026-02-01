import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { getBaseUrlFromHeaders } from "@/lib/requestBaseUrl";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = await getBaseUrlFromHeaders();

  return createMetadata({
    title: "Termeni și condiții - Musclepals",
    description: "Regulamentul magazinului online, politici de retur și informații legale.",
    canonicalPath: "/terms",
    locale,
    baseUrl,
  });
}

export default async function TermsPage() {
  return (
    <div style={{ padding: 24, boxSizing: "border-box" }}>
      <div className="card stack-16">
        <h1 className="h1">TERMENI ȘI CONDIȚII AI MAGAZINULUI ONLINE MUSCLEPALS</h1>

        <div className="nunito-regular" style={{ lineHeight: 1.6 }}>
          <p>
            În cazul oricăror probleme cu comanda, trimiteți un mesaj la adresa de e-mail:{" "}
            <a href="mailto:support@musclepals.com" style={{ textDecoration: "underline", fontWeight: "bold" }}>
              support@musclepals.com
            </a>
          </p>
          <p>
            <strong>În vigoare de la: 14 decembrie 2025</strong>
          </p>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 1. Dispoziții generale și definiții</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Prezenții Termeni și Condiții stabilesc regulile de utilizare a Magazinului Online disponibil la adresa https://musclepals.com, în special regulile privind încheierea contractelor de vânzare a Conținutului digital și a Produselor Personalizate, regulile de plată, livrare și procedura de reclamație.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Definițiile utilizate în Termeni și Condiții înseamnă:
              <ul style={{ marginTop: "8px" }}>
                <li>
                  <strong>Vânzător (Profesionist):</strong> Szymon Świderski care desfășoară activitate economică la adresa: ul. Polna 16/40, 26‑200 Końskie, Polonia, NIP (Cod fiscal): 6582003346, REGON: 542587327, e‑mail: support@musclepals.com, tel.: +48 665 417 983.
                </li>
                <li>
                  <strong>Client:</strong> persoana fizică, persoana juridică sau unitatea organizatorică fără personalitate juridică, care efectuează o achiziție în Magazin.
                </li>
                <li>
                  <strong>Consumator:</strong> Clientul care este o persoană fizică și care efectuează o achiziție ce nu este legată direct de activitatea sa comercială sau profesională.
                </li>
                <li>
                  <strong>Conținut Digital (Produs Gata Făcut):</strong> date produse și furnizate în format digital, care nu sunt create la comandă individuală (de ex. e-book-uri despre masă musculară, planuri de antrenament PDF gata făcute).
                </li>
                <li>
                  <strong>Produs Personalizat (AI):</strong> Conținut digital neprefabricat, realizat pe baza specificațiilor Clientului sau servind la satisfacerea nevoilor individualizate ale acestuia. Acestea sunt, în special: Planurile de antrenament personalizate și Analiza detaliată a siluetei (Rapoarte BMI/BMR) generate de software bazat pe inteligență artificială pe baza datelor introduse de Client (de ex. greutate, înălțime, obiectiv).
                </li>
                <li>
                  <strong>Serviciu Digital:</strong> serviciu prestat pe cale electronică, de ex. accesul la un curs online în panoul clientului.
                </li>
                <li>
                  <strong>Magazin:</strong> serviciul online administrat de Vânzător la adresa https://musclepals.com.
                </li>
              </ul>
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 2. Cerințe tehnice</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Pentru utilizarea Magazinului și a produselor achiziționate sunt necesare:
              <ul style={{ marginTop: "8px" }}>
                <li>un dispozitiv cu acces la Internet,</li>
                <li>o adresă de e-mail activă,</li>
                <li>un program care permite vizualizarea fișierelor în format PDF (de ex. Adobe Reader) și dezarhivarea fișierelor ZIP.</li>
              </ul>
            </li>
            <li style={{ marginBottom: "8px" }}>
              Vânzătorul nu este responsabil pentru imposibilitatea de a citi fișierul rezultată din incompatibilitatea hardware din partea Clientului, dacă fișierul este conform cu standardele comune (PDF/ZIP).
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 3. Obiectul vânzării și specificul Produselor AI</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Prețurile produselor afișate în Magazin sunt prețuri brute (conțin toate taxele datorate) și sunt exprimate în zloți polonezi (PLN) sau în moneda locală, dacă este specificat altfel.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Notă legală privind Produsele Personalizate (AI):</strong> Clientul ia la cunoștință că Produsele Personalizate (planuri, rapoarte BMI/BMR) sunt generate automat de algoritmi de inteligență artificială (Google Gemini) pe baza datelor furnizate de Client.
              <ul style={{ marginTop: "8px" }}>
                <li>Aceste conținuturi au caracter educațional și informativ.</li>
                <li>Acestea nu constituie sfaturi medicale, dietetice sau de fizioterapie în sensul prevederilor legale.</li>
                <li>Înainte de implementarea recomandărilor (dietă, exerciții), Clientul ar trebui să se consulte cu un medic, în special în cazul afecțiunilor existente sau al accidentărilor. În cea mai largă măsură permisă de lege, Vânzătorul nu își asumă răspunderea pentru accidentări sau efecte asupra sănătății rezultate din aplicarea planurilor fără supravegherea unui specialist.</li>
              </ul>
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 4. Încheierea contractului și realizarea comenzii</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Pentru a plasa o comandă, Clientul selectează produsul, îl adaugă în coș și completează formularul de comandă.
            </li>
            <li style={{ marginBottom: "8px" }}>
              În cazul Produselor Personalizate, Clientul este obligat să furnizeze parametri reali și exacți (greutate, vârstă, obiectiv etc.). Furnizarea de date eronate duce la generarea unui raport eronat, ceea ce nu constituie un temei pentru reclamație.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Apăsarea butonului de finalizare a comenzii (de ex. „Cumpăr și plătesc” / „Comandă cu obligația de a plăti”) semnifică plasarea unei comenzi ferme și obligația de plată.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Realizarea comenzii (trimiterea fișierului sau acordarea accesului) are loc automat după primirea de către Vânzător a confirmării plății de la operator (de obicei în câteva minute).
            </li>
            <li style={{ marginBottom: "8px" }}>
              În cazul furnizării unei adrese de e-mail greșite de către Client, retrimiterea produsului poate necesita contactarea Serviciului Clienți și verificarea identității.
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 5. Plăți</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Entitatea care asigură procesarea plăților online este Przelewy24 (PayPro S.A.) sau alți operatori indicați în coșul de cumpărături (de ex. Stripe).
            </li>
            <li style={{ marginBottom: "8px" }}>
              Forme de plată disponibile: Carduri de plată (Visa, MasterCard, Maestro), și alte metode disponibile în funcție de locația Clientului.
            </li>
            <li style={{ marginBottom: "8px" }}>
              În lipsa plății în termen de 60 de minute de la plasarea comenzii, Vânzătorul are dreptul de a anula comanda.
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 6. Dreptul de retragere din contract (Retururi)</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Consumatorul are dreptul de a se retrage din contract în termen de 14 zile fără a indica motivul, cu rezerva alin. 2 și 3 de mai jos.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>LIPSA DREPTULUI DE RETUR PENTRU PRODUSELE PERSONALIZATE:</strong>
              <br />
              Conform legislației privind drepturile consumatorilor (în special Art. 16 lit. c din OUG 34/2014), dreptul de retragere din contractul la distanță nu se acordă Consumatorului în ceea ce privește contractele în care obiectul prestației este un produs neprefabricat, realizat conform specificațiilor Consumatorului sau care servește satisfacerii nevoilor sale individualizate.
              <ul style={{ marginTop: "8px" }}>
                <li>
                  <strong>Acest lucru se aplică pentru:</strong> Planurile de antrenament personalizate și Rapoartele BMI/BMR personalizate (analiza siluetei), care sunt generate individual pentru Client. Achiziția acestor produse este finală.
                </li>
              </ul>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Dreptul de retur pentru Produsele Gata Făcute (E-book-uri standard):</strong>
              <br />
              În cazul E-book-urilor standard (nepersonalizate), Consumatorul se poate retrage din contract în termen de 14 zile.
              <ul style={{ marginTop: "8px" }}>
                <li>Pentru a exercita dreptul de retragere, Consumatorul trebuie să informeze Vânzătorul cu privire la decizia sa printr-o declarație neechivocă trimisă la adresa de e-mail: <strong>support@musclepals.com</strong>.</li>
                <li>În declarație trebuie menționate: numele și prenumele, numărul comenzii, data achiziției și adresa de e-mail utilizată la comandă.</li>
                <li>Vânzătorul va efectua rambursarea plății folosind aceeași metodă de plată utilizată de Consumator, în termen de până la 14 zile de la primirea declarației.</li>
              </ul>
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 6a. Garanția Voluntară de Satisfacție</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Independent de dreptul legal de retragere din contract și de excepțiile descrise la § 6, Vânzătorul oferă Clienților o Garanție de Satisfacție suplimentară, voluntară.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Această garanție permite obținerea rambursării fondurilor în cazul în care Clientul nu este mulțumit de efectele sau calitatea produsului achiziționat, chiar dacă acesta este un Produs Personalizat.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Termenul de valabilitate a Garanției:</strong> Posibilitatea de a utiliza Garanția de Satisfacție se activează abia după trecerea a 14 zile de la data plasării comenzii. Clientul are apoi la dispoziție o lună (30 de zile) pentru a notifica dorința de a utiliza această opțiune (adică notificările sunt acceptate în perioada cuprinsă între a 15-a și a 45-a zi de la momentul achiziției).
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Procedura de notificare:</strong> Pentru a beneficia de Garanție, Clientul este obligat să contacteze Vânzătorul, trimițând un mesaj la adresa de e-mail dedicată: <a href="mailto:support@musclepals.com" style={{textDecoration: 'underline'}}>support@musclepals.com</a>.
              <ul style={{ marginTop: "8px" }}>
                <li>În conținutul mesajului, Clientul trebuie să menționeze clar că solicită „garanția”.</li>
                <li>Acest lucru este crucial pentru a distinge acest proces de returul standard (retragerea din contract), care în cazul produselor personalizate nu se acordă prin efectul legii. Notificările care conțin doar informația despre dorința de „retur” pot fi respinse în baza § 6 alin. 2 din Regulament, dacă nu invocă în mod direct Garanția Voluntară de Satisfacție.</li>
                <li>În cazul în care Clientul solicită rambursarea fondurilor în intervalul de timp de valabilitate a Garanției de Satisfacție, dar nu folosește explicit formularea „garanție”, Serviciul Clienți va întreba Clientul dacă intenția sa este de a apela la Garanția de Satisfacție, în scopul procesării corecte a cererii.</li>
              </ul>
            </li>
            <li style={{ marginBottom: "8px" }}>
              Rambursarea fondurilor în cadrul Garanției de Satisfacție va avea loc folosind aceeași metodă de plată utilizată de Client, în termen de până la 14 zile de la verificarea pozitivă a notificării.
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 7. Reclamații (Neconformitatea bunului cu contractul)</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Vânzătorul are obligația de a furniza Conținut digital sau Serviciu digital conform cu contractul.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Dacă produsul nu este conform cu contractul (de ex. fișierul este deteriorat, nu poate fi deschis, lipsesc pagini, link-ul nu a fost primit), Consumatorul poate depune o reclamație.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Reclamațiile trebuie depuse pe cale electronică la adresa: <strong>support@musclepals.com</strong>.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Notificarea reclamației trebuie să conțină: numărul comenzii, descrierea defectului și data constatării acestuia.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Vânzătorul va răspunde la reclamație în termen de 14 zile calendaristice.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Limitarea reclamațiilor de fond:</strong> Reclamațiile privind evaluarea subiectivă a utilității conținutului sau nemulțumirea față de sugestiile de antrenament/dietă generate de AI nu constituie un temei pentru constatarea neconformității bunului cu contractul, atâta timp cât produsul a fost generat corect tehnic pe baza datelor furnizate de Client.
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 8. Drepturi de autor și licență</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Toate produsele disponibile în Magazin constituie opere în sensul legii privind dreptul de autor și drepturile conexe.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Clientul, cumpărând produsul, primește o licență neexclusivă, netransmisibilă pentru utilizarea produsului exclusiv pentru propriile nevoi personale.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Este interzisă:
              <ul style={{ marginTop: "8px" }}>
                <li>Distribuirea produselor către terți.</li>
                <li>Publicarea conținutului produselor pe Internet (în totalitate sau parțial).</li>
                <li>Revânzarea produselor.</li>
                <li>Utilizarea planurilor de antrenament pentru desfășurarea de activități comerciale (de ex. antrenarea altor persoane pe baza planului achiziționat) fără acordul Vânzătorului.</li>
              </ul>
            </li>
            <li style={{ marginBottom: "8px" }}>
              În cazul detectării încălcării drepturilor de autor, Vânzătorul poate solicita despăgubiri pe cale judecătorească.
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 9. Date cu caracter personal</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Administratorul datelor cu caracter personal este Vânzătorul.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Datele sunt prelucrate în scopul realizării comenzii, iar în cazul produselor AI – și în scopul generării automatizate a conținutului (profilare necesară pentru executarea contractului).
            </li>
            <li style={{ marginBottom: "8px" }}>
              Regulile detaliate de prelucrare a datelor se găsesc în Politica de Confidențialitate disponibilă în Magazin.
            </li>
          </ol>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>§ 10. Dispoziții finale</h3>
          <ol style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={{ marginBottom: "8px" }}>
              Termenii și Condițiile fac parte integrantă din contractul de vânzare încheiat cu Clientul.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Vânzătorul își rezervă dreptul de a introduce modificări în Termeni și Condiții din motive importante (modificarea legii, modificări tehnice). Pentru comenzile plasate înainte de modificare se aplică versiunea Termenilor și Condițiilor în vigoare la momentul achiziției.
            </li>
            <li style={{ marginBottom: "8px" }}>
              În problemele nereglementate se aplică prevederile legii poloneze, cu mențiunea că această alegere de lege nu privează Consumatorul de protecția acordată prin dispozițiile imperative ale legii statului în care își are reședința obișnuită (de ex. legislația română privind protecția consumatorilor).
            </li>
            <li style={{ marginBottom: "8px" }}>
              Clientul are posibilitatea de a utiliza metode extrajudiciare de soluționare a reclamațiilor și de revendicare a pretențiilor, inclusiv prin platforma SOL UE: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>https://ec.europa.eu/consumers/odr</a> sau adresându-se autorității locale pentru protecția consumatorilor (în România: ANPC).
            </li>
          </ol>
        </div>

        <div className="center" style={{ marginTop: 40 }}>
          <Link href="/" style={{ color: "#111", textDecoration: "underline" }}>
            Înapoi la site
          </Link>
        </div>
      </div>
    </div>
  );
}