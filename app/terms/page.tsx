import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" />
          Tagasi
        </Link>

        <h1 className="text-3xl font-bold mb-8">Kasutustingimused</h1>

        <div className="bg-[#3e4551] rounded-lg p-6 space-y-6">
          <div>
            <p className="text-gray-400 mb-6">Kehtiv alates: 1. jaanuar 2024</p>
            
            <p className="mb-4">
              Tere tulemast FitQ platvormile! Need kasutustingimused ("Tingimused") reguleerivad teie juurdepääsu 
              ja kasutamist FitQ veebilehele, mobiilirakendustele ja teenustele (ühiselt "Teenused").
            </p>
            
            <p className="mb-4">
              Kasutades meie Teenuseid, nõustute nende Tingimustega. Kui te ei nõustu kõigi Tingimustega, 
              palume mitte kasutada meie Teenuseid.
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold mb-3">1. Teenuste kirjeldus</h2>
            <div className="text-gray-300 space-y-2">
              <p>FitQ pakub järgmiseid teenuseid:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Personaliseeritud treeningkavad ja juhendvideod</li>
                <li>Toitumissoovitused ja kalorite jälgimine</li>
                <li>Edusammude jälgimine ja statistika</li>
                <li>Treenerite konsultatsioonid</li>
                <li>Kogukonna funktsioonid ja väljakutsed</li>
                <li>Tervise- ja heaolualane sisu</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Konto loomine ja vastutus</h2>
            <div className="text-gray-300 space-y-3">
              <div>
                <h3 className="font-semibold text-white mb-1">2.1 Registreerimine</h3>
                <p>
                  Teenuste kasutamiseks peate looma konto. Kohustute esitama õiged, täpsed ja ajakohased andmed 
                  ning hoidma neid ajakohasena.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">2.2 Konto turvalisus</h3>
                <p>
                  Olete vastutav oma konto turvalisuse eest. Ärge jagage oma sisselogimisandmeid kolmandate osapooltega. 
                  Teavitage meid viivitamatult konto volitamata kasutamisest.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">2.3 Vanusepiirang</h3>
                <p>
                  Teenuste kasutamiseks peate olema vähemalt 16-aastane. 
                  Alla 18-aastased kasutajad vajavad vanema või hooldaja nõusolekut.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Teenuste kasutamine</h2>
            <div className="text-gray-300 space-y-3">
              <div>
                <h3 className="font-semibold text-white mb-1">3.1 Lubatud kasutamine</h3>
                <p>Võite kasutada Teenuseid ainult seaduslikel eesmärkidel ja vastavalt nendele Tingimustele.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">3.2 Keelatud tegevused</h3>
                <p>Teenuste kasutamisel on keelatud:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Seaduste või kolmandate osapoolte õiguste rikkumine</li>
                  <li>Vale või eksitava info esitamine</li>
                  <li>Pahatahtliku koodi või viiruste levitamine</li>
                  <li>Teenuste töö häirimine või kahjustamine</li>
                  <li>Automatiseeritud süsteemide kasutamine ilma loata</li>
                  <li>Teiste kasutajate ahistamine või häirimine</li>
                  <li>Intellektuaalse omandi õiguste rikkumine</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Tellimused ja maksed</h2>
            <div className="text-gray-300 space-y-3">
              <div>
                <h3 className="font-semibold text-white mb-1">4.1 Hinnad</h3>
                <p>
                  Teenuste hinnad on näidatud eurodes ja sisaldavad käibemaksu. 
                  Jätame õiguse hindu muuta, teavitades sellest 30 päeva ette.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">4.2 Maksmine</h3>
                <p>
                  Aktsepteerime järgmiseid maksevahendeid: pangalingid, krediitkaardid, Stebby. 
                  Maksed töödeldakse turvaliselt läbi sertifitseeritud makseteenuse pakkujate.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">4.3 Tellimuste automaatne uuendamine</h3>
                <p>
                  Kuutellimused uuenevad automaatselt, kui te neid ei tühista. 
                  Saate tellimuse igal ajal tühistada konto seadetes.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">4.4 Tagastused</h3>
                <p>
                  Digitaalsete teenuste puhul kehtib 14-päevane taganemisõigus alates ostu sooritamisest, 
                  välja arvatud juhul, kui olete alustanud teenuse kasutamist.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Intellektuaalne omand</h2>
            <div className="text-gray-300 space-y-3">
              <div>
                <h3 className="font-semibold text-white mb-1">5.1 FitQ omand</h3>
                <p>
                  Kõik Teenustega seotud sisu, sealhulgas tekstid, graafikad, logod, videod, 
                  treeningkavad ja tarkvara, on FitQ või selle litsentsiandjate omand.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">5.2 Kasutajalitsents</h3>
                <p>
                  Anname teile piiratud, mitteeksklusiivse, mitteülekantava litsentsi 
                  kasutada Teenuseid isiklikuks mittekaubanduslikuks otstarbeks.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">5.3 Kasutaja sisu</h3>
                <p>
                  Säilitate omandiõiguse sisule, mille laadite üles. 
                  Annate FitQ-le litsentsi kasutada teie sisu Teenuste pakkumiseks.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Meditsiiniline vastutus</h2>
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 text-gray-300">
              <p className="font-semibold text-yellow-400 mb-2">OLULINE HOIATUS:</p>
              <p className="mb-2">
                FitQ ei paku meditsiinilisi nõuandeid. Treeningkavad ja toitumissoovitused on üldise iseloomuga 
                ning ei asenda professionaalset meditsiinilist nõustamist.
              </p>
              <p>
                Enne uue treeningprogrammi alustamist konsulteerige arstiga, eriti kui teil on 
                terviseprobleeme või vigastusi. FitQ ei vastuta vigastuste või tervisekahjustuste eest, 
                mis võivad tekkida Teenuste kasutamisel.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Vastutuse piirangud</h2>
            <div className="text-gray-300 space-y-2">
              <p>Seadusega lubatud ulatuses:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>FitQ ei vastuta kaudsete, juhuslike või tagajärjena tekkinud kahjude eest</li>
                <li>Meie vastutus piirdub viimase 12 kuu jooksul teie poolt makstud summaga</li>
                <li>Teenused pakutakse "nagu on" ja "nagu saadaval" põhimõttel</li>
                <li>Ei garanteeri Teenuste katkematut või veatu toimimist</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Kahju hüvitamine</h2>
            <div className="text-gray-300">
              <p>
                Nõustute hüvitama ja kaitsma FitQ-d kõigi nõuete, kahjude ja kulude eest, 
                mis tulenevad teie poolsest Tingimuste rikkumisest või Teenuste väärkasutamisest.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Teenuste muutmine ja lõpetamine</h2>
            <div className="text-gray-300 space-y-3">
              <div>
                <h3 className="font-semibold text-white mb-1">9.1 Muudatused</h3>
                <p>
                  Võime igal ajal muuta, peatada või lõpetada Teenuseid või nende osi. 
                  Olulistest muudatustest teavitame 30 päeva ette.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-1">9.2 Konto lõpetamine</h3>
                <p>
                  Võite oma konto igal ajal sulgeda. FitQ võib lõpetada või peatada teie konto, 
                  kui rikute Tingimusi või ei maksa õigeaegselt.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Privaatsus</h2>
            <div className="text-gray-300">
              <p>
                Teie privaatsus on meile oluline. Isikuandmete töötlemist reguleerib meie 
                <Link href="/privacy" className="text-[#40b236] hover:text-[#60cc56]"> Privaatsuspoliitika</Link>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Vaidluste lahendamine</h2>
            <div className="text-gray-300 space-y-2">
              <p>
                Püüame kõik vaidlused lahendada läbirääkimiste teel. 
                Kui kokkuleppele ei jõuta, lahendatakse vaidlused Eesti kohtutes.
              </p>
              <p>
                Tarbijavaidluste puhul on võimalik pöörduda ka Tarbijakaitseameti juures 
                tegutseva tarbijavaidluste komisjoni poole (www.komisjon.ee).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Kohaldatav õigus</h2>
            <div className="text-gray-300">
              <p>
                Nendele Tingimustele kohaldatakse Eesti Vabariigi õigust.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">13. Tingimuste muutmine</h2>
            <div className="text-gray-300">
              <p>
                Võime Tingimusi igal ajal muuta. Olulistest muudatustest teavitame e-posti 
                või rakendusesisese teate kaudu. Teenuste jätkuv kasutamine pärast muudatusi 
                tähendab nõustumist uute tingimustega.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">14. Eraldatavus</h2>
            <div className="text-gray-300">
              <p>
                Kui mõni Tingimuste säte osutub kehtetuks või jõustamatuks, 
                jäävad ülejäänud sätted kehtima täies ulatuses.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">15. Kontakt</h2>
            <div className="text-gray-300">
              <p>Küsimuste või probleemide korral võtke meiega ühendust:</p>
              <div className="mt-3 space-y-1">
                <p><strong className="text-white">FitQ Studio OÜ</strong></p>
                <p>E-post: info@fitq.ee</p>
                <p>Telefon: +372 5555 5555</p>
                <p>Aadress: Metsa 10, Elva 61503, Tartumaa, Eesti</p>
                <p>Registrikood: 12345678</p>
              </div>
            </div>
          </section>

          <div className="mt-8 p-4 bg-[#2c313a] rounded-lg">
            <p className="text-center text-gray-400">
              Viimati uuendatud: 1. jaanuar 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}