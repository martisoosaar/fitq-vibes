import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          Tagasi
        </Link>

        <h1 className="text-3xl font-bold mb-8">Privaatsuspoliitika</h1>

        <div className="bg-[#3e4551] rounded-lg p-6 space-y-6">
          <div>
            <p className="text-gray-400 mb-6">Kehtiv alates: 1. jaanuar 2024</p>
            
            <p className="mb-4">
              FitQ OÜ (edaspidi "meie", "meid" või "FitQ") austab teie privaatsust ja on pühendunud teie isikuandmete kaitsele. 
              Käesolev privaatsuspoliitika kirjeldab, kuidas me kogume, kasutame ja kaitseme teie andmeid.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Andmed, mida kogume</h2>
            <div className="space-y-3 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-1">1.1 Kontoteave</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nimi ja e-posti aadress</li>
                  <li>Telefoni number (vabatahtlik)</li>
                  <li>Profiilipilt (vabatahtlik)</li>
                  <li>Sünnikuupäev ja sugu (treeningute kohandamiseks)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">1.2 Tervise- ja treeningandmed</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Pikkus, kaal ja kehamassiindeks</li>
                  <li>Treeningute ajalugu ja eesmärgid</li>
                  <li>Toitumisharjumused (vabatahtlik)</li>
                  <li>Terviseseisund (ainult teie nõusolekul)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">1.3 Tehnilised andmed</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP-aadress ja seadme info</li>
                  <li>Veebilehitseja tüüp ja versioon</li>
                  <li>Sisselogimise aeg ja asukoht</li>
                  <li>Rakenduse kasutusstatistika</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Kuidas kasutame teie andmeid</h2>
            <div className="space-y-2 text-gray-300">
              <p>Teie andmeid kasutame järgmistel eesmärkidel:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Teenuste pakkumine ja konto haldamine</li>
                <li>Personaliseeritud treeningkavade loomine</li>
                <li>Edusammude jälgimine ja analüüs</li>
                <li>Klienditoe pakkumine</li>
                <li>Teenuste parendamine ja arendamine</li>
                <li>Turunduskommunikatsioon (teie nõusolekul)</li>
                <li>Seaduslike kohustuste täitmine</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Andmete jagamine</h2>
            <div className="space-y-3 text-gray-300">
              <p>Me ei müü ega rendi teie isikuandmeid kolmandatele osapooltele. Võime jagada andmeid järgmistel juhtudel:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Teie selge nõusolekuga</li>
                <li>Teenusepakkujatega (nt makseteenused, e-posti teenused)</li>
                <li>Seaduslike nõuete täitmiseks</li>
                <li>Ettevõtte ümberkorraldamise korral</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Andmete turvalisus</h2>
            <div className="space-y-2 text-gray-300">
              <p>
                Rakendame asjakohaseid tehnilisi ja organisatsioonilisi meetmeid teie andmete kaitsmiseks:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>SSL-krüpteerimine andmeedastuses</li>
                <li>Krüpteeritud andmete salvestamine</li>
                <li>Regulaarsed turvaauditid</li>
                <li>Piiratud juurdepääs isikuandmetele</li>
                <li>Töötajate konfidentsiaalsuskohustus</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Andmete säilitamine</h2>
            <div className="text-gray-300">
              <p>
                Säilitame teie isikuandmeid niikaua, kui see on vajalik teenuste pakkumiseks või seaduslike kohustuste täitmiseks:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Aktiivsed kontod: andmeid säilitatakse konto kehtivuse ajal</li>
                <li>Mitteaktiivsed kontod: kustutatakse 3 aasta pärast</li>
                <li>Maksedokumendid: 7 aastat vastavalt seadusele</li>
                <li>Turundusloend: kuni nõusoleku tagasivõtmiseni</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Teie õigused</h2>
            <div className="space-y-3 text-gray-300">
              <p>GDPR-i alusel on teil järgmised õigused:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Õigus tutvuda oma andmetega</li>
                <li>Õigus andmete parandamisele</li>
                <li>Õigus andmete kustutamisele ("õigus olla unustatud")</li>
                <li>Õigus andmete töötlemise piiramisele</li>
                <li>Õigus andmete ülekandmisele</li>
                <li>Õigus esitada vastuväiteid</li>
                <li>Õigus võtta tagasi nõusolek</li>
              </ul>
              <p className="mt-3">
                Oma õiguste kasutamiseks võtke meiega ühendust: privacy@fitq.ee
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Küpsised</h2>
            <div className="text-gray-300">
              <p>
                Kasutame küpsiseid veebilehe funktsionaalsuse tagamiseks ja kasutuskogemuse parandamiseks:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Hädavajalikud küpsised: autentimine ja turvalisus</li>
                <li>Funktsionaalsed küpsised: eelistuste meeldejätmine</li>
                <li>Analüütilised küpsised: kasutusstatistika (Google Analytics)</li>
                <li>Turundusküpsised: ainult teie nõusolekul</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Laste privaatsus</h2>
            <div className="text-gray-300">
              <p>
                FitQ teenused on mõeldud vähemalt 16-aastastele kasutajatele. 
                Me ei kogu teadlikult alla 16-aastaste laste isikuandmeid. 
                Kui saame teada, et oleme kogunud alla 16-aastase lapse andmeid, 
                kustutame need viivitamatult.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Muudatused privaatsuspoliitikas</h2>
            <div className="text-gray-300">
              <p>
                Võime aeg-ajalt uuendada käesolevat privaatsuspoliitikat. 
                Olulistest muudatustest teavitame teid e-posti teel või rakenduses. 
                Soovitame regulaarselt privaatsuspoliitikat üle vaadata.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Kontakt</h2>
            <div className="text-gray-300">
              <p>Kui teil on küsimusi privaatsuspoliitika kohta, võtke meiega ühendust:</p>
              <div className="mt-3 space-y-1">
                <p><strong className="text-white">FitQ Studio OÜ</strong></p>
                <p>E-post: privacy@fitq.ee</p>
                <p>Telefon: +372 5555 5555</p>
                <p>Aadress: Metsa 10, Elva 61503, Tartumaa, Eesti</p>
                <p>Registrikood: 12345678</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Järelevalveasutus</h2>
            <div className="text-gray-300">
              <p>
                Kui te ei ole rahul sellega, kuidas me teie andmeid töötleme, 
                on teil õigus esitada kaebus Andmekaitse Inspektsioonile:
              </p>
              <div className="mt-3 space-y-1">
                <p><strong className="text-white">Andmekaitse Inspektsioon</strong></p>
                <p>E-post: info@aki.ee</p>
                <p>Telefon: +372 627 4135</p>
                <p>Veebileht: www.aki.ee</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}