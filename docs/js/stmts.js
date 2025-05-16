// Object containing H and P codes, GHS pictograms, and their phrases.
const stmts = {
	hStmtObj: {
        "H200": {
                "appliesTo": "Ontplofbare stoffen, instabiel.",
                "phrase": "Instabiele ontplofbare stof.",
                "picto": [
                        "explos"
                ]
        },
        "H201": {
                "appliesTo": "Ontplofbare stoffen, subklasse 1.1.",
                "phrase": "Ontplofbare stof: gevaar voor massa-explosie.",
                "picto": [
                        "explos"
                ]
        },
        "H202": {
                "appliesTo": "Ontplofbare stoffen, subklasse 1.2.",
                "phrase": "Ontplofbare stof, ernstig gevaar voor scherfwerking.",
                "picto": [
                        "explos"
                ]
        },
        "H203": {
                "appliesTo": "Ontplofbare stoffen, subklasse 1.3.",
                "phrase": "Ontplofbare stof; gevaar voor brand, luchtdrukwerking of scherfwerking.",
                "picto": [
                        "explos"
                ]
        },
        "H204": {
                "appliesTo": "Ontplofbare stoffen, subklasse 1.4.",
                "phrase": "Gevaar voor brand of scherfwerking.",
                "picto": [
                        "explos"
                ]
        },
        "H205": {
                "appliesTo": "Ontplofbare stoffen, subklasse 1.5.",
                "phrase": "Gevaar voor massa-explosie bij brand.",
                "picto": [
                        "none"
                ]
        },
        "H207": {
                "appliesTo": "Ontplofbare stoffen, subklasse 1.7.",
                "phrase": "Kan brand veroorzaken of brand bevorderen.",
                "picto": [
                        "none"
                ]
        },
        "H220": {
                "appliesTo": "Ontvlambare gassen, gevarencategorie 1.",
                "phrase": "Zeer licht ontvlambaar gas.",
                "picto": [
                        "flamme"
                ]
        },
        "H221": {
                "appliesTo": "Ontvlambare gassen, gevarencategorie 2.",
                "phrase": "Ontvlambaar gas.",
                "picto": [
                        "none"
                ]
        },
        "H222": {
                "appliesTo": "<a href=/wiki/Aerosol title=Aerosol>Aerosolen</a>, gevarencategorie 1.",
                "phrase": "Zeer licht ontvlambare aerosol.",
                "picto": [
                        "flamme"
                ]
        },
        "H223": {
                "appliesTo": "Aerosolen, gevarencategorie 2.",
                "phrase": "Ontvlambare aerosol.",
                "picto": [
                        "flamme"
                ]
        },
        "H224": {
                "appliesTo": "Ontvlambare vloeistoffen, gevarencategorie 1.",
                "phrase": "Zeer licht ontvlambare vloeistof en damp.",
                "picto": [
                        "flamme"
                ]
        },
        "H225": {
                "appliesTo": "Ontvlambare vloeistoffen, gevarencategorie 2.",
                "phrase": "Licht ontvlambare vloeistof en damp.",
                "picto": [
                        "flamme"
                ]
        },
        "H226": {
                "appliesTo": "Ontvlambare vloeistoffen, gevarencategorie 3.",
                "phrase": "Ontvlambare vloeistof en damp.",
                "picto": [
                        "flamme"
                ]
        },
        "H227": {
                "appliesTo": "Ontvlambare vloeistoffen, gevarencategorie 4.",
                "phrase": "Brandbare vloeistof.",
                "picto": [
                        "none"
                ]
        },
        "H228": {
                "appliesTo": "Ontvlambare vaste stoffen, gevarencategorie 1 en 2.",
                "phrase": "Ontvlambare vaste stof.",
                "picto": [
                        "flamme"
                ]
        },
        "H229": {
                "appliesTo": "Aerosolen, gevarencategorie&euml;n 1,2,3.",
                "phrase": "Houder onder druk: kan openbarsten bij verhitting.",
                "picto": [
                        "none"
                ]
        },
        "H230": {
                "appliesTo": "Ontvlambare gassen (waaronder chemisch instabiele gassen), gevarencategorie A.",
                "phrase": "Kan explosief reageren zelfs in afwezigheid van lucht.",
                "picto": [
                        "none"
                ]
        },
        "H231": {
                "appliesTo": "Ontvlambare gassen (waaronder chemisch instabiele gassen), gevarencategorie B.",
                "phrase": "Kan explosief reageren zelfs in afwezigheid van lucht bij verhoogde druk en/of temperatuur.",
                "picto": [
                        "none"
                ]
        },
        "H240": {
                "appliesTo": "Zelfontledende stoffen en mengsels, type A<br />Organische peroxiden, type A.",
                "phrase": "Ontploffingsgevaar bij verwarming.",
                "picto": [
                        "explos"
                ]
        },
        "H241": {
                "appliesTo": "Zelfontledende stoffen en mengsels, type B<br />Organische peroxiden, type B.",
                "phrase": "Brand- of ontploffingsgevaar bij verwarming.",
                "picto": [
                        "explos",
                        "flamme"
                ]
        },
        "H242": {
                "appliesTo": "Zelfontledende stoffen en mengsels, type C, D, E en F<br />Organische peroxiden, type C, D, E en F.",
                "phrase": "Brandgevaar bij verwarming.",
                "picto": [
                        "flamme"
                ]
        },
        "H250": {
                "appliesTo": "Pyrofore vloeistoffen, gevarencategorie 1<br />Pyrofore vaste stoffen, gevarencategorie 1.",
                "phrase": "Vat spontaan vlam bij blootstelling aan lucht.",
                "picto": [
                        "flamme"
                ]
        },
        "H251": {
                "appliesTo": "Voor zelfverhitting vatbare stoffen en mengsels, gevarencategorie 1.",
                "phrase": "Vatbaar voor zelfverhitting: kan vlam vatten.",
                "picto": [
                        "flamme"
                ]
        },
        "H252": {
                "appliesTo": "Voor zelfverhitting vatbare stoffen en mengsels, gevarencategorie 2.",
                "phrase": "In grote hoeveelheden vatbaar voor zelfverhitting: kan vlam vatten.",
                "picto": [
                        "none"
                ]
        },
        "H260": {
                "appliesTo": "Stoffen en mengsels die in contact met water ontvlambare gassen ontwikkelen, gevarencategorie 1.",
                "phrase": "In contact met water komen ontvlambare gassen vrij die spontaan kunnen ontbranden.",
                "picto": [
                        "flamme"
                ]
        },
        "H261": {
                "appliesTo": "Stoffen en mengsels die in contact met water ontvlambare gassen ontwikkelen, gevarencategorie 2 en 3.",
                "phrase": "In contact met water komen ontvlambare gassen vrij.",
                "picto": [
                        "flamme"
                ]
        },
        "H270": {
                "appliesTo": "Oxiderende gassen, gevarencategorie 1.",
                "phrase": "Kan brand veroorzaken of bevorderen; oxiderend.",
                "picto": [
                        "rondflam"
                ]
        },
        "H271": {
                "appliesTo": "Oxiderende vloeistoffen, gevarencategorie 1<br />Oxiderende vaste stoffen, gevarencategorie 1.",
                "phrase": "Kan brand of ontploffingen veroorzaken; sterk oxiderend.",
                "picto": [
                        "rondflam"
                ]
        },
        "H272": {
                "appliesTo": "Oxiderende vloeistoffen, gevarencategorie 2 en 3<br />Oxiderende vaste stoffen, gevarencategorie 2 en 3.",
                "phrase": "Kan brand bevorderen; oxiderend.",
                "picto": [
                        "rondflam"
                ]
        },
        "H280": {
                "appliesTo": "Gassen onder druk: samengeperst gas; vloeibaar gas; opgelost gas.",
                "phrase": "Bevat gas onder druk; kan ontploffen bij verwarming.",
                "picto": [
                        "bottle"
                ]
        },
        "H281": {
                "appliesTo": "Gassen onder druk: sterk gekoeld vloeibaar gas.",
                "phrase": "Bevat sterk gekoeld gas; kan cryogene brandwonden of letsel veroorzaken.",
                "picto": [
                        "bottle"
                ]
        },
        "H290": {
                "appliesTo": "Bijtend voor metalen, gevarencategorie 1.",
                "phrase": "Kan bijtend zijn voor metalen.",
                "picto": [
                        "acid"
                ]
        },
        "H300": {
                "appliesTo": "Acute orale toxiciteit, gevarencategorie 1 en 2.",
                "phrase": "Dodelijk bij inslikken.",
                "picto": [
                        "skull"
                ]
        },
        "H301": {
                "appliesTo": "Acute orale toxiciteit, gevarencategorie 3.",
                "phrase": "Giftig bij inslikken.",
                "picto": [
                        "skull"
                ]
        },
        "H302": {
                "appliesTo": "Acute orale toxiciteit, gevarencategorie 4.",
                "phrase": "Schadelijk bij inslikken.",
                "picto": [
                        "exclam"
                ]
        },
        "H304": {
                "appliesTo": "Aspiratiegevaar, gevarencategorie 1.",
                "phrase": "Kan dodelijk zijn als de stof bij inslikken in de luchtwegen terechtkomt.",
                "picto": [
                        "silhouette"
                ]
        },
        "H310": {
                "appliesTo": "Acute dermale toxiciteit, gevarencategorie 1 en 2.",
                "phrase": "Dodelijk bij contact met de huid.",
                "picto": [
                        "skull"
                ]
        },
        "H311": {
                "appliesTo": "Acute dermale toxiciteit, gevarencategorie 3.",
                "phrase": "Giftig bij contact met de huid.",
                "picto": [
                        "skull"
                ]
        },
        "H312": {
                "appliesTo": "Acute dermale toxiciteit, gevarencategorie 4.",
                "phrase": "Schadelijk bij contact met de huid.",
                "picto": [
                        "exclam"
                ]
        },
        "H314": {
                "appliesTo": "Huidcorrosie/-irritatie, gevarencategorie 1A, 1B en 1C.",
                "phrase": "Veroorzaakt ernstige brandwonden en oogletsels.",
                "picto": [
                        "acid"
                ]
        },
        "H315": {
                "appliesTo": "Huidcorrosie/-irritatie, gevarencategorie 2.",
                "phrase": "Veroorzaakt huidirritatie.",
                "picto": [
                        "exclam"
                ]
        },
        "H317": {
                "appliesTo": "Huidsensibilisatie, gevarencategorie 1.",
                "phrase": "Kan een allergische huidreactie veroorzaken.",
                "picto": [
                        "exclam"
                ]
        },
        "H318": {
                "appliesTo": "Ernstig oogletsel/oogirritatie, gevarencategorie 1.",
                "phrase": "Veroorzaakt ernstig oogletsel.",
                "picto": [
                        "acid"
                ]
        },
        "H319": {
                "appliesTo": "Ernstig oogletsel/oogirritatie, gevarencategorie 2A.",
                "phrase": "Veroorzaakt ernstige oogirritatie.",
                "picto": [
                        "exclam"
                ]
        },
        "H330": {
                "appliesTo": "Acute toxiciteit bij inademing, gevarencategorie 1 en 2.",
                "phrase": "Dodelijk bij inademing.",
                "picto": [
                        "skull"
                ]
        },
        "H331": {
                "appliesTo": "Acute toxiciteit bij inademing, gevarencategorie 3.",
                "phrase": "Giftig bij inademing.",
                "picto": [
                        "skull"
                ]
        },
        "H332": {
                "appliesTo": "Acute toxiciteit bij inademing, gevarencategorie 4.",
                "phrase": "Schadelijk bij inademing.",
                "picto": [
                        "exclam"
                ]
        },
        "H334": {
                "appliesTo": "Sensibilisatie van de luchtwegen, gevarencategorie 1.",
                "phrase": "Kan bij inademing allergie- of astmasymptomen of ademhalingsmoeilijkheden veroorzaken.",
                "picto": [
                        "silhouette"
                ]
        },
        "H335": {
                "appliesTo": "Specifieke doelorgaantoxiciteit bij eenmalige blootstelling, gevarencategorie 3, irritatie van de luchtwegen.",
                "phrase": "Kan irritatie van de luchtwegen veroorzaken.",
                "picto": [
                        "exclam"
                ]
        },
        "H336": {
                "appliesTo": "Specifieke doelorgaantoxiciteit bij eenmalige blootstelling, gevarencategorie 3, narcotische werking.",
                "phrase": "Kan slaperigheid of duizeligheid veroorzaken.",
                "picto": [
                        "exclam"
                ]
        },
        "H340": {
                "appliesTo": "Mutageniteit in geslachtscellen, gevarencategorie 1A en 1B.",
                "phrase": "Kan genetische schade veroorzaken <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H341": {
                "appliesTo": "Mutageniteit in geslachtscellen, gevarencategorie 2.",
                "phrase": "Verdacht van het veroorzaken van genetische schade <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H350": {
                "appliesTo": "Kankerverwekkendheid, gevarencategorie 1A en 1B.",
                "phrase": "Kan kanker veroorzaken <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H351": {
                "appliesTo": "Kankerverwekkendheid, gevarencategorie 2.",
                "phrase": "Verdacht van het veroorzaken van kanker <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H360": {
                "appliesTo": "Voortplantingstoxiciteit, gevarencategorie 1A en 1B.",
                "phrase": "Kan de vruchtbaarheid of het ongeboren kind schaden <i>&lt;specifiek effect vermelden indien bekend&gt;</i> <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H361": {
                "appliesTo": "Voortplantingstoxiciteit, gevarencategorie 2.",
                "phrase": "Kan mogelijk de vruchtbaarheid of het ongeboren kind schaden <i>&lt;specifiek effect vermelden indien bekend&gt;</i> <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H362": {
                "appliesTo": "Voortplantingstoxiciteit, aanvullende categorie, effecten op en via lactatie.",
                "phrase": "Kan schadelijk zijn via de borstvoeding.",
                "picto": [
                        "none"
                ]
        },
        "H370": {
                "appliesTo": "Specifieke doelorgaantoxiciteit bij eenmalige blootstelling, gevarencategorie 1.",
                "phrase": "Veroorzaakt schade aan organen <i>&lt;of alle betrokken organen vermelden indien bekend&gt;</i> <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is</i>&gt;.",
                "picto": [
                        "silhouette"
                ]
        },
        "H371": {
                "appliesTo": "Specifieke doelorgaantoxiciteit bij eenmalige blootstelling, gevarencategorie 2.",
                "phrase": "Kan schade aan organen <i>&lt;of alle betrokken organen vermelden indien bekend&gt;</i> veroorzaken <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H372": {
                "appliesTo": "Specifieke doelorgaantoxiciteit bij herhaalde blootstelling, gevarencategorie 1.",
                "phrase": "Veroorzaakt schade aan organen <i>&lt;of alle betrokken organen vermelden indien bekend&gt;</i> bij langdurige of herhaalde blootstelling <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H373": {
                "appliesTo": "Specifieke doelorgaantoxiciteit bij herhaalde blootstelling, gevarencategorie 2.",
                "phrase": "Kan schade aan organen <i>&lt;of alle betrokken organen vermelden indien bekend&gt;</i> veroorzaken bij langdurige of herhaalde blootstelling <i>&lt;blootstellingsroute vermelden indien afdoende bewezen is dat het gevaar bij andere blootstellingsroutes niet aanwezig is&gt;</i>.",
                "picto": [
                        "silhouette"
                ]
        },
        "H300+H310": {
                "appliesTo": "Acute orale toxiciteit en acute dermale toxiciteit, gevarencategorie 1 en 2.",
                "phrase": "Dodelijk bij inslikken en bij contact met de huid.",
                "picto": [
                        "none"
                ]
        },
        "H300+H330": {
                "appliesTo": "Acute orale toxiciteit en acute toxiciteit bij inademing, gevarencategorie 1 en 2.",
                "phrase": "Dodelijk bij inslikken en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H310+H330": {
                "appliesTo": "Acute dermale toxiciteit en acute toxiciteit bij inademing, gevarencategorie 1 en 2.",
                "phrase": "Dodelijk bij contact met de huid en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H300+H310+H330": {
                "appliesTo": "Acute orale toxiciteit, acute dermale toxiciteit en acute toxiciteit bij inademing,gevarencategorie 1 en 2.",
                "phrase": "Dodelijk bij inslikken, bij contact met de huid en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H301+H311": {
                "appliesTo": "Acute orale toxiciteit en acute dermale toxiciteit, gevarencategorie 3.",
                "phrase": "Giftig bij inslikken en bij contact met de huid.",
                "picto": [
                        "none"
                ]
        },
        "H301+H331": {
                "appliesTo": "Acute orale toxiciteit en acute toxiciteit bij inademing, gevarencategorie 3.",
                "phrase": "Giftig bij inslikken en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H311+H331": {
                "appliesTo": "Acute dermale toxiciteit en acute toxiciteit bij inademing, gevarencategorie 3.",
                "phrase": "Giftig bij contact met de huid en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H301+H311+H331": {
                "appliesTo": "Acute orale toxiciteit, acute dermale toxiciteit en acute toxiciteit bij inademing,gevarencategorie 3.",
                "phrase": "Giftig bij inslikken, bij contact met de huid en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H302+H312": {
                "appliesTo": "Acute orale toxiciteit en acute dermale toxiciteit, gevarencategorie 4.",
                "phrase": "Schadelijk bij inslikken en bij contact met de huid.",
                "picto": [
                        "none"
                ]
        },
        "H302+H332": {
                "appliesTo": "Acute orale toxiciteit en acute toxiciteit bij inademing, gevarencategorie 4.",
                "phrase": "Schadelijk bij inslikken en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H312+H332": {
                "appliesTo": "Acute dermale toxiciteit en acute toxiciteit bij inademing, gevarencategorie 4.",
                "phrase": "Schadelijk bij contact met de huid en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H302+H312+H332": {
                "appliesTo": "Acute orale toxiciteit, acute dermale toxiciteit en acute toxiciteit bij inademing,gevarencategorie 4.",
                "phrase": "Schadelijk bij inslikken, bij contact met de huid en bij inademing.",
                "picto": [
                        "none"
                ]
        },
        "H400": {
                "appliesTo": "Acuut gevaar voor het aquatisch milieu, gevarencategorie 1.",
                "phrase": "Zeer giftig voor in het water levende organismen.",
                "picto": [
                        "pollu"
                ]
        },
        "H410": {
                "appliesTo": "Chronisch gevaar voor het aquatisch milieu, gevarencategorie 1.",
                "phrase": "Zeer giftig voor in het water levende organismen, met langdurige gevolgen.",
                "picto": [
                        "pollu"
                ]
        },
        "H411": {
                "appliesTo": "Chronisch gevaar voor het aquatisch milieu, gevarencategorie 2.",
                "phrase": "Giftig voor in het water levende organismen, met langdurige gevolgen.",
                "picto": [
                        "pollu"
                ]
        },
        "H412": {
                "appliesTo": "Chronisch gevaar voor het aquatisch milieu, gevarencategorie 3.",
                "phrase": "Schadelijk voor in het water levende organismen, met langdurige gevolgen.",
                "picto": [
                        "none"
                ]
        },
        "H413": {
                "appliesTo": "Chronisch gevaar voor het aquatisch milieu, gevarencategorie 4.",
                "phrase": "Kan langdurige schadelijk gevolgen voor in het water levende organismen hebben.",
                "picto": [
                        "none"
                ]
        },
        "H420": {
                "appliesTo": "Gevaarlijk voor de ozonlaag, gevarencategorie 1.",
                "phrase": "Schadelijk voor de volksgezondheid en het milieu door afbraak van ozon in de bovenste lagen van de atmosfeer.",
                "picto": [
                        "exclam"
                ]
        }
},
	pStmtObj: {
        "P101": "Bij het inwinnen van medisch advies, de verpakking of het etiket ter beschikking houden.",
        "P102": "Buiten het bereik van kinderen houden.",
        "P103": "Alvorens te gebruiken, het etiket lezen.",
        "P201": "Alvorens te gebruiken, de speciale aanwijzingen raadplegen.",
        "P202": "Pas gebruiken nadat u alle veiligheidsvoorschriften gelezen en begrepen heeft.",
        "P210": "Verwijderd houden van warmte/vonken/open vuur/hete oppervlakken en andere ontstekingsbronnen. - Niet roken.",
        "P211": "Niet in een open vuur of op andere ontstekingsbronnen spuiten.",
        "P220": "Van kleding/.../brandbare stoffen verwijderd houden/bewaren.",
        "P221": "Vermenging met brandbare stoffen... absoluut vermijden.",
        "P222": "Contact met de lucht vermijden.",
        "P230": "Vochtig houden met...",
        "P231": "Onder inert gas werken.",
        "P232": "Tegen vocht beschermen.",
        "P233": "In goed gesloten verpakking bewaren.",
        "P234": "Uitsluitend in de oorspronkelijke verpakking bewaren.",
        "P235": "Koel bewaren.",
        "P240": "Opslag- en opvangreservoir aarden.",
        "P241": "Explosieveilige elektrische/ventilatie-/verlichtings-/...apparatuur gebruiken.",
        "P242": "Uitsluitend vonkvrij gereedschap gebruiken.",
        "P243": "Voorzorgsmaatregelen treffen tegen ontladingen van statische elektriciteit.",
        "P244": "Houd afsluiters en fittingen vrij van olie en vet.",
        "P250": "Malen/schokken/...wrijving vermijden.",
        "P251": "Ook na gebruik niet doorboren of verbranden.",
        "P260": "Stof/rook/gas/nevel/damp/spuitnevel niet inademen.",
        "P261": "Inademing van stof/rook/gas/nevel/damp/spuitnevel vermijden.",
        "P262": "Contact met de ogen, de huid of de kleding vermijden.",
        "P263": "Bij zwangerschap of borstvoeding aanraking vermijden.",
        "P264": "Na het werken met dit product ... grondig wassen.",
        "P270": "Niet eten, drinken of roken tijdens het gebruik van dit product.",
        "P271": "Alleen buiten of in een goed geventileerde ruimte gebruiken.",
        "P272": "Verontreinigde werkkleding mag de werkruimte niet verlaten.",
        "P273": "Voorkom lozing in het milieu.",
        "P280": "Beschermende kledij dragen.",
        "P281": "De nodige persoonlijke beschermingsuitrusting gebruiken.",
        "P282": "Koude-isolerende handschoenen/gelaatsbescherming/oogbescherming dragen.",
        "P283": "Vuur/vlambestendige/brandwerende kleding dragen.",
        "P284": "[Bij ontoereikende ventilatie] adembescherming dragen.",
        "P231+P232": "Onder inert gas werken. Tegen vocht beschermen.",
        "P235+P410": "Koel bewaren. Tegen zonlicht beschermen.",
        "P301": "NA INSLIKKEN: &rarr; onmiddellijk het antigifcentrum of een arts raadplegen.",
        "P302": "BIJ CONTACT MET DE HUID:.",
        "P303": "BIJ CONTACT MET DE HUID (of het haar):.",
        "P304": "NA INADEMING:.",
        "P305": "BIJ CONTACT MET DE OGEN: &rarr; onmiddellijk zachtjes afspoelen met water.",
        "P306": "NA MORSEN OP KLEDING: &rarr; Zo snel mogelijk de kledij uitdoen.",
        "P308": "NA (mogelijke) blootstelling:.",
        "P310": "Onmiddellijk een ANTIGIFCENTRUM/arts/... raadplegen.",
        "P311": "Een ANTIGIFCENTRUM/arts/... raadplegen.",
        "P312": "Bij onwel voelen een ANTIGIFCENTRUM/arts/... raadplegen.",
        "P313": "Een arts raadplegen.",
        "P314": "Bij onwel voelen een arts raadplegen.",
        "P315": "Onmiddellijk een arts raadplegen.",
        "P320": "Specifieke behandeling dringend vereist (zie ... op dit etiket).",
        "P321": "Specifieke behandeling vereist (zie ... op dit etiket).",
        "P330": "De mond spoelen.",
        "P331": "GEEN braken opwekken.",
        "P332": "Bij huidirritatie:.",
        "P333": "Bij huidirritatie of uitslag:.",
        "P334": "In koud water onderdompelen/nat verband aanbrengen.",
        "P335": "Losse deeltjes van de huid afvegen.",
        "P336": "Bevroren lichaamsdelen met lauw water ontdooien. Niet wrijven op de betrokken plaatsen.",
        "P337": "Bij aanhoudende oogirritatie:.",
        "P338": "Contactlenzen verwijderen, indien mogelijk. Blijven spoelen.",
        "P340": "De persoon in de frisse lucht brengen en ervoor zorgen dat deze gemakkelijk kan ademen.",
        "P342": "Bij ademhalingssymptomen:.",
        "P350": "voorzichtig wassen met veel water en zeep.",
        "P351": "Voorzichtig afspoelen met water gedurende een aantal minuten.",
        "P352": "Met veel water en zeep wassen.",
        "P353": "Huid met water afspoelen/afdouchen.",
        "P360": "Verontreinigde kleding en huid onmiddellijk met veel water afspoelen en pas daarna kleding uittrekken.",
        "P361": "Verontreinigde kleding onmiddellijk uittrekken.",
        "P362": "Verontreinigde kleding uittrekken.",
        "P363": "Verontreinigde kleding wassen alvorens deze opnieuw te gebruiken.",
        "P370": "In geval van brand:.",
        "P371": "In geval van grote brand en grote hoeveelheden:.",
        "P372": "Ontploffingsgevaar in geval van brand.",
        "P373": "NIET blussen wanneer het vuur de ontplofbare stoffen bereikt.",
        "P374": "Met normale voorzorgen vanaf een redelijke afstand blussen.",
        "P375": "Op afstand blussen omwille van ontploffingsgevaar.",
        "P376": "Het lek dichten als dat veilig gedaan kan worden.",
        "P377": "Brand door lekkend gas: niet blussen, tenzij het lek veilig gedicht kan worden.",
        "P378": "Blussen met...",
        "P380": "Evacueren.",
        "P381": "Alle ontstekingsbronnen wegnemen als dat veilig gedaan kan worden.",
        "P390": "Gelekte/gemorste stof opnemen om materi&euml;le schade te vermijden.",
        "P391": "Gelekte/gemorste stof opruimen.",
        "P301+P310": "NA INSLIKKEN: onmiddellijk een ANTIGIFCENTRUM/arts/... raadplegen.",
        "P301+P312": "NA INSLIKKEN: bij onwel voelen een ANTIGIFCENTRUM/arts/... raadplegen.",
        "P301+P330+P331": "NA INSLIKKEN: de mond spoelen -- GEEN braken opwekken.",
        "P302+P334": "BIJ CONTACT MET DE HUID: in koud water onderdompelen/nat verband aanbrengen.",
        "P302+P352": "BIJ CONTACT MET DE HUID: met veel water en zeep wassen.",
        "P303+P361+P353": "BIJ CONTACT MET DE HUID (of het haar): verontreinigde kleding onmiddellijk uittrekken. Huid met water afspoelen/afdouchen.",
        "P304+P340": "NA INADEMING: de persoon in de frisse lucht brengen en ervoor zorgen dat deze gemakkelijk kan ademen.",
        "P305+P351+P338": "BIJ CONTACT MET DE OGEN: voorzichtig afspoelen met water gedurende een aantal minuten; contactlenzen verwijderen, indien mogelijk; blijven spoelen.",
        "P306+P360": "NA MORSEN OP KLEDING: verontreinigde kleding en huid onmiddellijk met veel water afspoelen en pas daarna kleding uittrekken.",
        "P308+P311": "NA (mogelijke) blootstelling: een ANTIGIFCENTRUM/arts/... raadplegen.",
        "P308+P313": "NA (mogelijke) blootstelling: een arts raadplegen.",
        "P332+P313": "Bij huidirritatie: een arts raadplegen.",
        "P333+P313": "Bij huidirritatie of uitslag: een arts raadplegen.",
        "P335+P334": "Losse deeltjes van de huid afvegen. In koud water onderdompelen/nat verband aanbrengen.",
        "P337+P313": "Bij aanhoudende oogirritatie: een arts raadplegen.",
        "P342+P311": "Bij ademhalingssymptomen: een ANTIGIFCENTRUM/arts/... raadplegen.",
        "P361+P364": "Verontreinigde kleding onmiddellijk uittrekken en wassen alvorens deze opnieuw te gebruiken.",
        "P362+P364": "Verontreinigde kleding uittrekken en wassen alvorens deze opnieuw te gebruiken.",
        "P370+P376": "In geval van brand: het lek dichten als dat veilig gedaan kan worden.",
        "P370+P378": "In geval van brand: blussen met...",
        "P370+P380": "In geval van brand: evacueren.",
        "P370+P380+P375": "In geval van brand: evacueren. Op afstand blussen omwille van ontploffingsgevaar.",
        "P371+P380+P375": "In geval van grote brand en grote hoeveelheden: evacueren. Op afstand blussen omwille van ontploffingsgevaar.",
        "P401": "... bewaren.",
        "P402": "Op een droge plaats bewaren.",
        "P403": "Op een goed geventileerde plaats bewaren.",
        "P404": "In gesloten verpakking bewaren.",
        "P405": "Achter slot bewaren.",
        "P406": "In corrosiebestendige/... houder met corrosiebestendige binnenbekleding bewaren.",
        "P407": "Ruimte laten tussen stapels/pallets.",
        "P410": "Tegen zonlicht beschermen.",
        "P411": "Bij maximaal ... &deg;C/... &deg;F bewaren.",
        "P412": "Niet blootstellen aan temperaturen boven 50 &deg;C/122 &deg;F.",
        "P413": "Bulkmateriaal, indien meer dan ... kg/... lbs, bij temperaturen van maximaal ...&deg;C/... &deg;F bewaren.",
        "P420": "Gescheiden van ander materiaal bewaren.",
        "P422": "Onder ... bewaren.",
        "P402+P404": "Op een droge plaats bewaren. In gesloten verpakking bewaren.",
        "P403+P233": "Op een goed geventileerde plaats bewaren. In goed gesloten verpakking bewaren.",
        "P403+P235": "Op een goed geventileerde plaats bewaren. Koel bewaren.",
        "P410+P403": "Tegen zonlicht beschermen. Op een goed geventileerde plaats bewaren.",
        "P410+P412": "Tegen zonlicht beschermen. Niet blootstellen aan temperaturen boven 50 &deg;C/122 &deg;F.",
        "P411+P235": "Bij maximaal ... &deg;C/... &deg;F bewaren. Koel bewaren.",
        "P501A": "Inhoud/verpakking afvoeren naar gecertificeerde verwerker van afvalstromen.",
        "P501B": "Inhoud/verpakking afvoeren volgens plaatselijke voorschriften."
}
};