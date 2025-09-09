import React, { useState } from 'react';

export default function UserAgreement() {
  const [language, setLanguage] = useState('hu'); // HU default
  const [accepted, setAccepted] = useState(false);

  const content = {
    en: {
      title: 'Rules and User Agreement',
      rules: [
        'You must be at least 18 years old to register.',
        'You cannot be a family member of Vivko or Grand Slam Travel.',
        'The registering user and their travel partner must apply for an ESTA or tourist Visa (Grand Slam Travel will cooperate in the process of the application).',
        'Grand Slam Travel or Vivko are not responsible if the registered user or their travel partner’s ESTA/VISA application process is unsuccessful. In that case, a new registered user will be drawn.',
        'When traveling in the US, the registered user and their travel partner must obey the laws and rules of the United States.',
        'The registered user verification will be based on the username and password generated on this website. The verification process will be on a digital platform like Zoom.',
        'Media Consent: The selected registered user and their travel partner agree to appear in photos and videos on Vivko’s and Grand Slam Travel\'s social media platforms during the verification process and the trip itself.',
        'Verification Deadline: During the verification process, the drawn registered user will have 30 minutes to log in on the verification platform (<a href="https://zoom.us/download" target="_blank" rel="noopener noreferrer">Zoom</a>) and complete the verification process. After 30 minutes, a new registered user will be drawn. <br/><strong>Note:</strong> Please make sure Zoom is installed on your device before the verification session.',
      ],
      agreement: [
        'Privacy Policy: We do not collect or store any personal information during registration. Only the selected winner and their travel partner’s information will be collected by Grand Slam Travel via personal conversation, exclusively for booking, ESTA/VISA application, and travel arrangements.',
        'Payment Processing: All payments are securely processed via <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe</a>. Please review Stripe’s <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">User Agreement</a> on their official website.',
        'Refund Policy: The registration fee is non-refundable under any circumstances.',
      ],
      acceptanceText: 'I have read and accept the Rules and User Agreement',
      continueText: 'Continue to Payment',
    },
    hu: {
      title: 'Szabályok és Felhasználói Feltételek',
      rules: [
        'A regisztrációhoz legalább 18 évesnek kell lenned.',
        'Nem lehetsz Vivko vagy a Grand Slam Travel családtagja.',
        'A regisztráló felhasználónak és utazótársának ESTA-t vagy turista vízumot kell igényelnie (a Grand Slam Travel együttműködik az igénylési folyamatban).',
        'A Grand Slam Travel vagy Vivko nem felelős, ha a regisztrált felhasználó vagy utazótársa ESTA/VÍZUM igénylési folyamata sikertelen. Ebben az esetben új regisztrált felhasználót sorsolunk.',
        'Az Egyesült Államokban történő utazás során a regisztrált felhasználónak és utazótársának be kell tartania az Egyesült Államok törvényeit és szabályait.',
        'A regisztrált felhasználó hitelesítése a weboldalon a fizetés után generált felhasználónév és jelszó alapján történik. A hitelesítési folyamat digitális platformon, például a Zoom-on keresztül zajlik.',
        'Médiahozzájárulás: A kisorsolt regisztrált felhasználó és utazótársa hozzájárul, hogy a hitelesítési folyamat és az utazás során készült fotók és videók megjelenjenek Vivko és a Grand Slam Travel közösségi média platformjain.',
        'Hitelesítési Határidő: A hitelesítési folyamat során a kisorsolt regisztrált felhasználónak 30 perce van arra, hogy bejelentkezzen a hitelesítési platformra (<a href="https://zoom.us/download" target="_blank" rel="noopener noreferrer">Zoom</a>) felületén, és elvégezze a folyamatot. Ha ez 30 percen belül nem történik meg, új regisztrált felhasználót sorsolunk ki. <br/><strong>Megjegyzés:</strong> Kérjük, győződj meg róla a fenti Zoom linken, hogy a Zoom telepítve van az eszközödre a hitelesítési folyamat előtt.',
      ],
      agreement: [
        'Adatvédelmi nyilatkozat: A regisztráció során nem gyűjtünk és nem tárolunk semmilyen személyes adatot. Csak a kisorsolt nyertes és utazótársa adatait rögzíti a Grand Slam Travel személyes egyeztetés keretében, kizárólag a foglalás, az ESTA/VÍZUM igénylés, valamint az utazás ügyintézése céljából.',
        'Fizetés feldolgozása: Minden fizetés biztonságosan, a <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe</a> rendszerén keresztül történik. Kérjük, tekintse meg a Stripe hivatalos weboldalán az <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Adatvédelmi nyilatkozatot</a> és a <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">Felhasználói feltételeket</a>.',
        'Visszatérítési szabályzat: A regisztrációs díj semmilyen körülmények között nem visszatéríthető.',
      ],
      acceptanceText: 'Elolvastam és elfogadom a Szabályokat és a Felhasználói Feltételeket',
      continueText: 'Tovább a fizetéshez',
    },
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '160px' }}>
      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'hu' : 'en')}
        style={{
          backgroundColor: 'black',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        {language === 'en' ? 'Magyar' : 'English'}
      </button>

      <h1>{content[language].title}</h1>

      <h2>{language === 'en' ? 'Rules' : 'Szabályok'}</h2>
      <ol>
        {content[language].rules.map((rule, idx) => (
          <li key={idx} style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: rule }} />
        ))}
      </ol>

      <h2>{language === 'en' ? 'User Agreement' : 'Felhasználói Feltételek'}</h2>
      <ul>
        {content[language].agreement.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>

      {/* Acceptance Checkbox */}
      <div style={{ marginTop: '20px', fontSize: '1rem' }}>
        <label>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            style={{ marginRight: '10px' }}
          />
          {content[language].acceptanceText}
        </label>
      </div>

      {/* Sticky Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: accepted ? '#ff69b4' : 'gray',
          color: 'white',
          padding: '15px 30px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          cursor: accepted ? 'pointer' : 'not-allowed',
          opacity: accepted ? 1 : 0.6,
        }}
      >
        {accepted ? (
          <a
            href="/checkout"
            style={{ color: 'white', textDecoration: 'none' }}
          >
            {content[language].continueText}
          </a>
        ) : (
          <span>{content[language].continueText}</span>
        )}
      </div>
    </div>
  );
}
