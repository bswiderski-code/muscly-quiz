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
    title: "Politica de confidențialitate - Trener Strzykawa",
    description: "Informații despre prelucrarea datelor cu caracter personal (RGPD), cookie-uri și utilizarea AI.",
    canonicalPath: "/privacy",
    locale,
    baseUrl,
  });
}

export default async function PrivacyPage() {
  return (
    <div style={{ padding: 24, boxSizing: "border-box" }}>
      <div className="card stack-16">
        <h1 className="h1">POLITICA DE CONFIDENȚIALITATE A SERVICIULUI TRENERSTRZYKAWA.PL</h1>

        <div className="nunito-regular" style={{ lineHeight: 1.6 }}>
          <p>
            <strong>În vigoare de la: 4 ianuarie 2026</strong>
          </p>
          <p>
            Această Politică de Confidențialitate are scopul de a explica modul în care colectăm, stocăm și prelucrăm datele dumneavoastră cu caracter personal în legătură cu utilizarea site-ului nostru web (inclusiv subdomeniile: start.trenerstrzykawa.pl, kalkulator.trenerstrzykawa.pl și pagina principală). Confidențialitatea dumneavoastră este o prioritate pentru noi, motiv pentru care ne asigurăm de securitatea datelor dumneavoastră în conformitate cu RGPD (Regulamentul General privind Protecția Datelor).
          </p>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>1. Operatorul de Date cu Caracter Personal</h3>
          <p>Operatorul datelor dumneavoastră cu caracter personal este:</p>
          <p style={{ marginTop: "8px", marginBottom: "8px" }}>
            <strong>Szymon Świderski</strong><br />
            care desfășoară activitate economică<br />
            ul. Polna 16/40, 26-200 Końskie, Polonia<br />
            NIP (Cod fiscal): 6582003346<br />
            REGON: 542587327
          </p>
          <p>
            Contact pentru probleme legate de protecția datelor: <a href="mailto:trener@trenerstrzykawa.pl" style={{ textDecoration: "underline", fontWeight: "bold" }}>trener@trenerstrzykawa.pl</a>
          </p>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>2. Scopurile și temeiurile legale ale prelucrării datelor</h3>
          <p>Prelucrăm datele dumneavoastră în scopuri specifice și pe baza următoarelor temeiuri legale:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li style={{ marginBottom: "8px" }}>
              <strong>Generarea planurilor de antrenament și dietă (Date privind sănătatea):</strong> În scopul analizei siluetei, condiției fizice și sănătății dumneavoastră de către algoritmi AI și pentru crearea unui produs personalizat.<br />
              <em>Temei legal: Art. 9 alin. (2) lit. a) din RGPD (Consimțământul dumneavoastră explicit exprimat prin bifarea căsuței dedicate din formular).</em>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Executarea contractului și gestionarea comenzilor:</strong> În scopul încheierii tranzacției, livrării fișierelor digitale și administrării contului de utilizator.<br />
              <em>Temei legal: Art. 6 alin. (1) lit. b) din RGPD (necesar pentru executarea contractului).</em>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Contabilitate și obligații fiscale:</strong> Emiterea facturilor și ținerea evidenței contabile.<br />
              <em>Temei legal: Art. 6 alin. (1) lit. c) din RGPD (obligație legală).</em>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Comunicare și trimiterea notificărilor (e-mail tranzacțional):</strong> Trimiterea produselor comandate și răspunsul la solicitări.<br />
              <em>Temei legal: Art. 6 alin. (1) lit. f) din RGPD (interes legitim) sau lit. b) (executarea contractului).</em>
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Analiză, Marketing și Programe de Afiliere:</strong> Analiza traficului, remarketing (Google Ads, Social Media) și decontarea partenerilor care recomandă serviciul.<br />
              <em>Temei legal: Art. 6 alin. (1) lit. f) din RGPD (interes legitim) sau Art. 6 alin. (1) lit. a) din RGPD (consimțământ pentru fișiere cookie).</em>
            </li>
          </ul>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>3. Sfera datelor colectate și caracterul voluntar</h3>
          <p>În funcție de serviciu, prelucrăm:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li><strong>Date de identificare:</strong> Nume, e-mail, țară.</li>
            <li><strong>Date privind sănătatea și silueta (Categorii speciale de date):</strong> Vârsta, sexul, greutatea, înălțimea, nivelul de grăsime corporală (bodyfat), accidentări, dificultăți de antrenament.</li>
            <li><strong>Date comportamentale:</strong> Activitatea pe site, istoricul comenzilor.</li>
          </ul>
          <p style={{ marginTop: "12px" }}>
            <strong>Important – Caracterul voluntar al furnizării datelor:</strong><br />
            Furnizarea datelor, inclusiv a datelor privind sănătatea, este complet voluntară. Cu toate acestea, din cauza specificului serviciului (personalizarea planului prin AI), lipsa consimțământului pentru prelucrarea datelor privind sănătatea (nebifarea căsuței de consimțământ) ne va face imposibilă generarea planului de antrenament. Fără aceste date, sistemul nu poate selecta în siguranță exercițiile sau dieta.
          </p>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>4. Utilizarea Inteligenței Artificiale (Crearea de profiluri)</h3>
          <p>
            Vă informăm că în procesul de prestare a serviciilor utilizăm tehnologii AI (modele Google Gemini). Datele dumneavoastră (inclusiv cele de sănătate, pentru care v-ați dat consimțământul) sunt analizate în mod automatizat pentru a crea un plan unic. Deciziile luate de sistem influențează forma finală a produsului (selecția exercițiilor/caloriilor).
          </p>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>5. Găzduire, Infrastructură și Securitate</h3>
          <p>Avem grijă de securitatea datelor utilizând o infrastructură verificată:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li><strong>Prelucrare și Baze de Date:</strong> Serverele Hetzner Online GmbH (Germania) – aici funcționează sistemele noastre de automatizare.</li>
            <li><strong>Stocarea fișierelor (Arhiva comenzilor):</strong> Fișierele PDF gata făcute cu planurile dumneavoastră sunt stocate în siguranță în serviciul Hetzner Storage Box (S3), localizat în Spațiul Economic European (Germania/Finlanda).</li>
            <li><strong>Securitate:</strong> Folosim criptare SSL și hashing-ul parolelor.</li>
          </ul>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>6. Destinatarii datelor și Transferul în afara SEE</h3>
          <p>
            Transmitem datele dumneavoastră entităților care ne sprijină în activitate. Datorită caracterului global al serviciilor digitale, unii dintre furnizorii noștri au sediul în SUA. În aceste cazuri, transferul datelor se face pe baza Cadrului privind confidențialitatea datelor (Data Privacy Framework) sau a Clauzelor Contractuale Standard (SCC), ceea ce garantează un nivel adecvat de securitate.
          </p>
          <p style={{ marginTop: "8px" }}><strong>Lista destinatarilor:</strong></p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li><strong>Servicii AI și Analiză:</strong> Google (SUA/Irlanda): Generarea planurilor (Gemini), analiză (GA4), reclame (Google Ads).</li>
            <li><strong>Marketing și Social Media:</strong> Meta Platforms (Facebook/Instagram), TikTok, Sisteme de Afiliere. Datele pot fi transferate în SUA.</li>
            <li><strong>Plăți:</strong> PayU S.A. (Polonia), Stripe Payments Europe, Ltd. (Irlanda/SUA).</li>
            <li><strong>Comunicare E-mail:</strong> Postmark (ActiveCampaign, LLC - SUA).</li>
            <li><strong>Contabilitate:</strong> InFakt Sp. z o.o. (Polonia).</li>
          </ul>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>7. Perioada de stocare a datelor (Retenția)</h3>
          <p>Stocăm datele dumneavoastră doar atât timp cât este necesar:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li><strong>Documentația contabilă (facturi):</strong> Timp de 5 ani calculați de la sfârșitul anului calendaristic.</li>
            <li><strong>Datele contului de utilizator și istoricul comenzilor:</strong> Pe durata prestării serviciului și timp de 3 ani după încetarea acestuia.</li>
            <li><strong>Date de marketing:</strong> Până la retragerea consimțământului.</li>
            <li><strong>Fișiere temporare:</strong> Șterse imediat sau după expirarea sesiunii.</li>
          </ul>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>8. Fișiere Cookies, Remarketing și Google Ads</h3>
          <p>Site-ul nostru utilizează fișiere cookies în următoarele scopuri:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li>Menținerea sesiunii utilizatorului.</li>
            <li><strong>Google Ads și Remarketing:</strong> Afișarea reclamelor personalizate.</li>
            <li><strong>Afiliere:</strong> Urmărirea recomandărilor de la parteneri.</li>
          </ul>
          <p style={{ marginTop: "8px" }}>Puteți gestiona fișierele cookies din setările browserului dumneavoastră sau din bara de cookies de pe site-ul nostru.</p>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>9. Drepturile dumneavoastră</h3>
          <p>Aveți dreptul la:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
            <li>Accesul la datele dumneavoastră, rectificarea, ștergerea sau restricționarea prelucrării acestora.</li>
            <li>Portabilitatea datelor.</li>
            <li><strong>Retragerea consimțământului:</strong> În special a consimțământului pentru prelucrarea datelor privind sănătatea.</li>
            <li>Formularea unei obiecții față de marketing.</li>
            <li>Depunerea unei plângeri la Președintele UODO (Polonia) sau la autoritatea de supraveghere competentă din țara dumneavoastră.</li>
          </ul>

          <h3 style={{ marginTop: "24px", marginBottom: "12px", fontWeight: "bold" }}>10. Contact</h3>
          <p>
            Pentru probleme legate de datele cu caracter personal, scrieți-ne la: <a href="mailto:trener@trenerstrzykawa.pl" style={{ textDecoration: "underline" }}>trener@trenerstrzykawa.pl</a>.
          </p>
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