# Testovací aplikace Ubuquiti

## TODO
- Nastavení správné URL
- Správný port

## Nastavení aplikace
Nastavení je k dispozici v souboru `src/settings.js`
* `baseUrl` (string) - základní URL API bez lomítka na konci
* `endpointSubmit`, `endpointUpload`, `endpointData` (string) - endpointy k jednotlivým requestům
* `autoUpdates` (boolean) - pokud je TRUE, jsou po načtení aplikace stažena data a také jsou periodicky stahována v intervalu `updateInterval`
* `updateInterval` (number) - interval v milisekundách, ve kterém jsou aktualizována data ze serveru. Má smysl pouze pokud `autoUpdates = true`
* `appendDataImmediately` (boolean) - způsb aktualizace dat po odeslání formuláře
    * pokud je TRUE, data jsou po odeslání formuláře rovnou vloženy do storu. Vzhledem k tomu, že data z formuláře prošla validací, můžeme předpokládat, že můžeme data do tabulky zařadit. Tato možnost ovšem nezahrnuje situaci, pokud by došlo u odeslaných dat na serveru k nějakým změnám. Potom by byla data na frontendu v tabulce nekonzistentní s daty na serveru. Ovšem pouze po dodu několika vteřin do obnovení tabulky.
    * pokud je FALSE, po odeslání formuláře je zavolán GET na server a data se aktualizí přímo ze serveru
* `formValidationEnabled` (boolean) - pokud je TRUE, je zapnuta validace dat formuláře (vypínání využíváno při testech)

## Hlavní použité knihovny
* Základní knihovny podle zadání `react`, `redux`, `redux-form`
* `redux-thunk ` - doplněk pro Redux pro podporu asynchronních akcí
* `reselect` - jednoduchá knihovna pro Redux umožňující snadné cachování selektorů
* `@material-ui` - Grafická knihovna s prvky pro UI ve stylu material design
* `axios` - provádění requestů na server. Zvažoval jsem zda nepoužít nativní Fetch API, ale nakonec jsem zvolil Axios z důvodu jednodušší implementace progress baru
* `seamless-immutable` - Immutable knihovna, kterou využívám v Redux storu. Výhodou je, že se k těmto immutable objektům dá přistupovat stejně jako k nativním (samozřejmě nelze je měnit)
* `lodash` - sada užitečných funkcí
* `classnames` - umožňuje slučovat více CSS tříd
* `@testing-library` - end to end testování, využívám 3 modulů `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`
* `msw` - mock API pro testovací účely

## Validace dat
* Formulář
    * Zadávané hodnoty jsou validovány přes html atributy a následně JS ve validační funkci Redux-Form
    * Formulář korektně pracuje s chybovými hláškami zaslanými ze serveru. Pokud je to možné, zobrazí chybovou hlášku přímo u daného pole.
* Stažení dat ze serveru
    * Po provedení GET requestu je provedena validace příchozích dat před vložením do storu

## Implementační poznámky
* U tabulky by bylo v případě většího množství dat vhodné použít stránkování, ideláně nějaké DataTable řešení
* Pokud by bylo na serveru velké množství dat, mělo by načítání probíhat s nějakým limitem a offsetem, aby se zbytečně nezatěžovala síť.
* U záznamů na serveru by bylo vhodné držet časové značky uploadu a následně by si aplikace žádala pouze nové položky (změny), aby se zbytečně neposílala stále stejná data
* Formulář by bylo vhodné nějakým způsobem zabezpečit - pokud by byl veřejně přístupný bez autentizace, dalo by se použít třeba alespoň podpesání tokenem

## Testy
Využívám end to end testy s mock API
* Renderování aplikace a jejích prvků
    * Korektní vyrenderování formuláře a jeho prvků
    * Korektní vyrenderování tabulky s daty
* Stahování dat ze serveru
    * Stažení validních dat a jejich zobrazení v tabulce
    * Stažení nevalidních dat a zobrazení chybové hlášky
    * Stažení validních dat, kde však nejdou žádné položky a zobrazení příslušné informace
    * Chyba sítě během stahování a zobrazení chybové hlášky
    * Test stažení dat z produkční API (http://file-upload.ubncloud.com)
* Formulář
    * Validace povinných polí formuláře
    * Úspěšné vyplnění a odeslání formuláře
    * Chyba sítě během stahování a zobrazení chybové hlášky
    * Odeslání nevalidních dat na server a zobrazení chybové hlášky