export interface ModelData {
    id: string;
    category: 'Mar' | 'Mangle' | 'Terrestre';
    title: string;
    scientificName: string;
    tag: string;
    description: string;
    funFact: string;
    location: string;
    androidModel: string;
    iosModel: string;
}

export const modelsDatabase: ModelData[] = [
    {
        "id": "barracuda",
        "category": "Mar",
        "title": "Gran Barracuda",
        "scientificName": "Sphyraena barracuda",
        "tag": "🏊 Depredador Veloz del Caribe",
        "description": "La Gran Barracuda es un depredador marino ágil y veloz que puede alcanzar hasta 2 metros de longitud. Su cuerpo alargado y plateado, con una mandíbula prominente llena de dientes afilados, la convierten en una de las cazadoras más temidas de los arrecifes. Habita en arrecifes coralinos y aguas abiertas del Caribe colombiano.",
        "funFact": "¡Puede nadar a velocidades de hasta 58 km/h, lo que la convierte en uno de los peces más rápidos del océano! Los juveniles se refugian en los manglares del Parque Tayrona antes de migrar a los arrecifes cuando son adultos.",
        "location": "Arrecifes coralinos del Parque Tayrona — bahías de Chengue, Gayraca y Neguanje",
        "androidModel": "Gran barracuda (Sphyraena barracuda).glb",
        "iosModel": "Gran barracuda (Sphyraena barracuda).usdz"
    },
    {
        "id": "cangrejo_fantasma",
        "category": "Mar",
        "title": "Cangrejo Fantasma",
        "scientificName": "Ocypode quadrata",
        "tag": "👻 El Velocista Invisible",
        "description": "El Cangrejo Fantasma del Atlántico es un crustáceo de color arena que habita las playas y dunas costeras del Parque Tayrona. Construye madrigueras profundas en la arena y es más activo durante la noche, cuando sale a buscar alimento como restos de algas, moluscos y otros invertebrados.",
        "funFact": "¡Corre tan rápido (hasta 16 km/h) que parece \"desaparecer\" como un fantasma — de ahí su nombre! Sus ojos pueden girar 360° y tiene visión tanto diurna como nocturna. Además, puede producir sonidos chirriantes frotando sus pinzas para comunicarse.",
        "location": "Playas arenosas del Parque Tayrona — Arrecifes, La Piscina, Cabo San Juan",
        "androidModel": "Cangrejo fantasma del Atlántico (Ocypode quadrata).glb",
        "iosModel": "Cangrejo fantasma del Atlántico (Ocypode quadrata).usdz"
    },
    {
        "id": "damisela_azul",
        "category": "Mar",
        "title": "Damisela Azul",
        "scientificName": "Chromis cyanea",
        "tag": "💙 Zafiro del Caribe",
        "description": "La Damisela Azul es un pequeño pez de un azul eléctrico intenso que brilla como una joya viviente en el arrecife. Vive en grupos sobre cabezas de coral, donde se alimenta de plancton flotante. Su belleza la convierte en una de las especies más fotografiadas del Caribe colombiano.",
        "funFact": "Su asombroso color azul eléctrico no proviene de pigmentos sino de nanoestructuras en sus escamas que reflejan la luz de una forma especial (coloración estructural). Es el mismo fenómeno que produce el azul iridiscente de las alas de una mariposa morpho.",
        "location": "Arrecifes coralinos del Parque Tayrona — abundante en bahía de Chengue",
        "androidModel": "Pez damisela azul de Chromis o zafiro del Caribe (Chromis cyanea).glb",
        "iosModel": "Pez damisela azul de Chromis o zafiro del Caribe (Chromis cyanea).usdz"
    },
    {
        "id": "langosta",
        "category": "Mar",
        "title": "Langosta Espinosa",
        "scientificName": "Panulirus argus",
        "tag": "🦞 La Marchadora del Fondo",
        "description": "La Langosta Espinosa del Caribe es un crustáceo grande sin pinzas pero con antenas espinosas enormes que usa como defensa. Habita en grietas y cuevas de los arrecifes durante el día y sale a cazar de noche. Es una de las especies de mayor importancia comercial en todo el Caribe.",
        "funFact": "Realizan migraciones masivas caminando en filas de hasta 60 individuos por el fondo marino, una detrás de otra en una \"conga\" submarina. Se comunican produciendo sonidos chirriantes frotando la base de sus antenas contra su caparazón — un sonido que se puede escuchar bajo el agua.",
        "location": "Arrecifes y fondos rocosos del Parque Tayrona — especialmente en Cinto",
        "androidModel": "Langosta espinosa del Caribe (Panulirus argus).glb",
        "iosModel": "Langosta espinosa del Caribe (Panulirus argus).usdz"
    },
    {
        "id": "mero",
        "category": "Mar",
        "title": "Mero Guasa",
        "scientificName": "Epinephelus itajara",
        "tag": "🏛️ Gigante de los Arrecifes",
        "description": "El Mero Guasa es uno de los peces óseos más grandes del Caribe. Puede medir más de 2.5 metros y pesar hasta 360 kg. Es un depredador tope que habita en cuevas de arrecifes de coral y zonas de manglar del Parque Tayrona, donde juega un papel crucial en el equilibrio del ecosistema marino.",
        "funFact": "¡Pueden vivir más de 40 años! Es tan curioso que a menudo se acerca a los buzos para observarlos. Lamentablemente, debido a la sobrepesca, hoy es una especie en peligro crítico de extinción que debemos proteger.",
        "location": "Cuevas y arrecifes del Parque Tayrona — zonas de manglar de la Ciénaga Grande de Santa Marta",
        "androidModel": "Pez Mero guasa (Epinephelus itajara).glb",
        "iosModel": "Pez Mero guasa (Epinephelus itajara).usdz"
    },
    {
        "id": "pargo",
        "category": "Mar",
        "title": "Pargo Rojo",
        "scientificName": "Lutjanus purpureus",
        "tag": "🔴 Tesoro de la Pesca Artesanal",
        "description": "El Pargo Rojo es un pez de gran importancia comercial con un llamativo color rojo brillante y cuerpo robusto. Es un depredador nocturno que se alimenta de peces pequeños, crustáceos y moluscos. Durante el día descansa en cuevas y grietas de los arrecifes profundos.",
        "funFact": "¡Puede vivir más de 50 años y alcanzar 1 metro de longitud! Es una de las especies más importantes para la pesca artesanal en la Sierra Nevada de Santa Marta y un plato emblemático de la gastronomía caribeña colombiana.",
        "location": "Arrecifes profundos del Parque Tayrona y plataforma continental de la Sierra Nevada de Santa Marta",
        "androidModel": "Pez Pargo rojo (Lutjanus purpureus).glb",
        "iosModel": "Pez Pargo rojo (Lutjanus purpureus).usdz"
    },
    {
        "id": "pez_cirujano",
        "category": "Mar",
        "title": "Pez Cirujano Azul",
        "scientificName": "Acanthurus coeruleus",
        "tag": "💎 Joya Azul del Arrecife",
        "description": "El Pez Cirujano Azul del Atlántico es un herbívoro de color azul brillante que se alimenta de algas en los arrecifes. Posee una espina afilada como un bisturí en la base de la cola, que usa como defensa. Es esencial para la salud del arrecife, ya que controla el crecimiento de algas que podrían asfixiar los corales.",
        "funFact": "La espina en su cola es tan afilada como un escalpelo de cirujano — de ahí su nombre. Los juveniles son de color amarillo brillante y cambian gradualmente a azul intenso al madurar, un cambio de color espectacular que ocurre durante varios meses.",
        "location": "Arrecifes coralinos del Parque Tayrona — especialmente en Granate y Chengue",
        "androidModel": "Pez cirujano azul del Atlántico (Acanthurus coeruleus).glb",
        "iosModel": "Pez cirujano azul del Atlántico (Acanthurus coeruleus).usdz"
    },
    {
        "id": "pez_cofre",
        "category": "Mar",
        "title": "Pez Cofre",
        "scientificName": "Lactophrys triqueter",
        "tag": "📦 Pez Acorazado",
        "description": "El Pez Cofre es un pequeño pez con un \"esqueleto externo\" único formado por placas óseas hexagonales que le dan forma de caja triangular. Nada lentamente usando sus pequeñas aletas como remos, lo que le da un aspecto adorable y torpe. Se alimenta de esponjas, algas e invertebrados pequeños.",
        "funFact": "Su caparazón es tan resistente y aerodinámico que inspiró el diseño del Mercedes-Benz Bionic Concept Car. Cuando se estresa, libera una toxina llamada ostracitoxina que puede matar a otros peces que estén en el mismo acuario o espacio cercano.",
        "location": "Arrecifes poco profundos y praderas marinas del Parque Tayrona",
        "androidModel": "Pez Cofre - Pez tronco liso o gallinita (Lactophrys triqueter).glb",
        "iosModel": "Pez Cofre - Pez tronco liso o gallinita (Lactophrys triqueter).usdz"
    },
    {
        "id": "pez_globo",
        "category": "Mar",
        "title": "Pez Globo",
        "scientificName": "Sphoeroides spengleri",
        "tag": "🎈 La Pelota Tóxica del Mar",
        "description": "El Pez Globo de bandas doradas es un pez pequeño y fascinante que se infla como una pelota cuando se siente amenazado. Tiene bandas oscuras y puntos característicos por todo el cuerpo. Se alimenta de invertebrados del fondo marino en las praderas de pastos marinos y fondos arenosos del Parque Tayrona.",
        "funFact": "Cuando se infla, ¡triplica su tamaño normal tragando agua a gran velocidad! Contiene tetrodotoxina, una de las sustancias más tóxicas conocidas: es 1,200 veces más venenosa que el cianuro. Un solo pez globo tiene suficiente toxina para matar a 30 personas.",
        "location": "Fondos arenosos y praderas de pastos marinos del Parque Tayrona",
        "androidModel": "Pez globo de bandas doradas o pez globo soplador (Sphoeroides spengleri).glb",
        "iosModel": "Pez globo de bandas doradas o pez globo soplador (Sphoeroides spengleri).usdz"
    },
    {
        "id": "pez_leon",
        "category": "Mar",
        "title": "Pez León",
        "scientificName": "Pterois volitans",
        "tag": "⚠️ Especie Invasora",
        "description": "El Pez León es una especie invasora originaria del Indo-Pacífico que ha colonizado el Caribe. Posee espinas venenosas y aletas en forma de abanico espectaculares. Su apetito voraz (puede comer hasta 30 veces su volumen estomacal) amenaza gravemente la biodiversidad de los arrecifes caribeños, ya que no tiene depredadores naturales en estas aguas.",
        "funFact": "Sus 18 espinas dorsales contienen veneno que causa dolor intenso en humanos. En Colombia se promueve activamente su caza y consumo como medida de control poblacional — ¡y resulta que es delicioso! Su carne blanca y firme se prepara en ceviche, frito o a la parrilla.",
        "location": "Arrecifes coralinos de todo el Parque Tayrona — especialmente en Cinto y Arrecifes",
        "androidModel": "Pez león (Pterois volitans).glb",
        "iosModel": "Pez león (Pterois volitans).usdz"
    },
    {
        "id": "pez_loro",
        "category": "Mar",
        "title": "Pez Loro Verde",
        "scientificName": "Sparisoma viride",
        "tag": "🦜 Fabricante de Playas",
        "description": "El Pez Loro Verde es un herbívoro grande y colorido que raspa las algas de los corales con su \"pico\" formado por dientes fusionados, similar al pico de un loro. Es esencial para la salud del arrecife coralino porque evita que las algas ahoguen los corales, manteniendo el equilibrio del ecosistema.",
        "funFact": "¡Un solo pez loro produce hasta 90 kg de arena blanca al año! Al triturar el coral para extraer las algas, los fragmentos de carbonato de calcio pasan por su sistema digestivo y salen como arena fina. Las playas de arena blanca del Caribe son, en gran parte, ¡\"caca\" de pez loro!",
        "location": "Arrecifes coralinos del Parque Tayrona — bahías de Gayraca y Neguanje",
        "androidModel": "Pez loro verde o loro brilloso (Sparisoma viride).glb",
        "iosModel": "Pez loro verde o loro brilloso (Sparisoma viride).usdz"
    },
    {
        "id": "pez_mariposa",
        "category": "Mar",
        "title": "Pez Mariposa",
        "scientificName": "Chaetodon capistratus",
        "tag": "🦋 El Pez de los Cuatro Ojos",
        "description": "El Pez Mariposa de cuatro ojos es un pez elegante con un ingenioso sistema de defensa: un falso \"ojo\" grande y negro cerca de la cola, mientras una banda oscura oculta su ojo real. Se alimenta de pólipos de coral, anémonas y pequeños invertebrados en los arrecifes poco profundos.",
        "funFact": "El \"ojo falso\" en la cola confunde a los depredadores, haciéndolos atacar la parte equivocada del cuerpo mientras el pez escapa en dirección opuesta. Además, forman parejas monógamas que permanecen juntas durante toda su vida, nadando siempre uno al lado del otro.",
        "location": "Arrecifes coralinos poco profundos del Parque Tayrona",
        "androidModel": "Pez mariposa de cuatro ojos (Chaetodon capistratus).glb",
        "iosModel": "Pez mariposa de cuatro ojos (Chaetodon capistratus).usdz"
    },
    {
        "id": "pez_trompeta",
        "category": "Mar",
        "title": "Pez Trompeta",
        "scientificName": "Aulostomus maculatus",
        "tag": "🎭 Maestro del Camuflaje",
        "description": "El Pez Trompeta del Atlántico es un pez alargado y delgado con un hocico tubular que usa para succionar presas pequeñas como un aspirador marino. Es un maestro del camuflaje que puede cambiar de color para mimetizarse con su entorno, escondiéndose entre corales blandos y gorgonias.",
        "funFact": "Se disfraza nadando verticalmente junto a gorgonias y corales blandos para parecer una rama más. También usa una táctica ingeniosa: se \"esconde\" detrás de peces más grandes como los loros para acercarse sigilosamente a sus presas sin ser detectado.",
        "location": "Arrecifes coralinos poco profundos del Parque Tayrona — bahía de Chengue",
        "androidModel": "Pez trompeta del Atlántico (Aulostomus maculatus).glb",
        "iosModel": "Pez trompeta del Atlántico (Aulostomus maculatus).usdz"
    },
    {
        "id": "pulpo",
        "category": "Mar",
        "title": "Pulpo del Caribe",
        "scientificName": "Octopus briareus",
        "tag": "🧠 Genio de 9 Cerebros",
        "description": "El Pulpo de arrecife del Caribe es un cefalópodo extraordinariamente inteligente con 8 brazos cubiertos de ventosas. Maestro del camuflaje, puede cambiar su color, textura y hasta forma en milisegundos para mimetizarse con cualquier superficie. Es un cazador nocturno de crustáceos y moluscos.",
        "funFact": "Tiene 3 corazones, sangre azul (contiene hemocianina a base de cobre en vez de hemoglobina) y 9 cerebros: uno central y uno en cada brazo. Puede resolver laberintos, abrir frascos cerrados, reconocer personas individuales y hasta usar herramientas — es considerado el invertebrado más inteligente del planeta.",
        "location": "Arrecifes coralinos y rocosos del Parque Tayrona — activo de noche en Chengue",
        "androidModel": "Pulpo de arrecife del Caribe (Octopus briareus).glb",
        "iosModel": "Pulpo de arrecife del Caribe (Octopus briareus).usdz"
    },
    {
        "id": "sargento_mayor",
        "category": "Mar",
        "title": "Sargento Mayor",
        "scientificName": "Abudefduf saxatilis",
        "tag": "🎖️ El Soldado del Arrecife",
        "description": "El Sargento Mayor es un pez pequeño pero territorial con características franjas verticales negras sobre un fondo plateado-amarillento, que recuerdan las insignias de un sargento militar. Los machos son padres dedicados que defienden agresivamente sus nidos de huevos color púrpura adheridos a las rocas.",
        "funFact": "El macho cambia dramáticamente de color a azul oscuro cuando cuida los huevos y se vuelve extremadamente agresivo, ¡atacando incluso a buzos que se acercan demasiado a su nido! Es uno de los peces más comunes y fáciles de observar en el arrecife.",
        "location": "Arrecifes costeros y rocosos de todo el Parque Tayrona",
        "androidModel": "Pez Damisela Sargento Mayor (Abudefduf saxatilis).glb",
        "iosModel": "Pez Damisela Sargento Mayor (Abudefduf saxatilis).usdz"
    },
    {
        "id": "tetra_colombiano",
        "category": "Mar",
        "title": "Tetra Colombiano",
        "scientificName": "Hyphessobrycon columbianus",
        "tag": "🇨🇴 Endémico de Colombia",
        "description": "El Tetra Colombiano es un pez de agua dulce endémico de Colombia. Pequeño y colorido, destaca por sus reflejos azulados metálicos y aletas rojizas. Vive en cardúmenes en ríos y quebradas cristalinas de la Sierra Nevada de Santa Marta, alimentándose de insectos y materia vegetal.",
        "funFact": "Es endémico de Colombia — no se encuentra de forma natural en ningún otro lugar del mundo. A pesar de ello, es muy popular en la acuariofilia internacional y se cría en cautiverio en países de Europa y Asia. ¡Un embajador colombiano nadando en acuarios del mundo entero!",
        "location": "Ríos y quebradas de la Sierra Nevada de Santa Marta — cuencas del río Don Diego y Buritaca",
        "androidModel": "Pez Tetra colombiano (Hyphessobrycon columbianus).glb",
        "iosModel": "Pez Tetra colombiano (Hyphessobrycon columbianus).usdz"
    },
    {
        "id": "tortuga_carey",
        "category": "Mar",
        "title": "Tortuga Carey",
        "scientificName": "Eretmochelys imbricata",
        "tag": "🐢 Navegante Ancestral",
        "description": "La Tortuga Carey es una tortuga marina en peligro crítico de extinción, reconocible por su hermoso caparazón con escamas superpuestas de colores ámbar y marrón. Se alimenta principalmente de esponjas tóxicas que otros animales marinos evitan, cumpliendo un rol ecológico único en los arrecifes.",
        "funFact": "Puede contener la respiración hasta 5 horas mientras descansa en el fondo. Navega miles de kilómetros por el océano usando el campo magnético terrestre como GPS natural, para regresar exactamente a la misma playa donde nació a poner sus huevos. Los científicos aún investigan cómo funciona este sentido magnético.",
        "location": "Playas de anidación y arrecifes del Parque Tayrona — Cinto, Chengue y Granate",
        "androidModel": "Tortuga carey (Eretmochelys imbricata).glb",
        "iosModel": "Tortuga carey (Eretmochelys imbricata).usdz"
    },
    {
        "id": "mangle_blanco",
        "category": "Mangle",
        "title": "Mangle Blanco",
        "scientificName": "Laguncularia racemosa",
        "tag": "🔴 El de los Puntitos Rojos",
        "description": "El Mangle Blanco crece en zonas más elevadas del manglar, donde la inundación es menos frecuente. Tiene glándulas secretoras de sal en la base de sus hojas y tolera menor salinidad que los otros mangles. Sus hojas son más anchas y redondeadas, con un color verde claro característico.",
        "funFact": "Sus hojas tienen dos pequeñas glándulas rojas en la base del pecíolo que secretan sal — puedes verlas a simple vista como dos puntitos rojos. Es una forma fácil de identificarlo en campo. Sus frutos son flotantes y pueden germinar mientras navegan por el agua, colonizando nuevas áreas.",
        "location": "Zonas interiores de manglares en la Ciénaga Grande — desembocaduras de ríos de la Sierra Nevada",
        "androidModel": "Mangle blanco (Laguncularia racemosa).glb",
        "iosModel": "Mangle blanco (Laguncularia racemosa).usdz"
    },
    {
        "id": "mangle_boton",
        "category": "Mangle",
        "title": "Mangle Botón",
        "scientificName": "Conocarpus erectus",
        "tag": "🔘 El Impostor del Manglar",
        "description": "El Mangle Botón (también conocido como Mangle Zaragoza o Botoncillo) es un arbusto o árbol pequeño que crece en la zona más alta del manglar, donde apenas llega el agua salada. Produce frutos pequeños en forma de botón o piña que le dan su nombre característico.",
        "funFact": "Técnicamente no es un \"verdadero\" mangle, sino un asociado del ecosistema de manglar — ¡un impostor botánico! Su madera es tan dura y resistente a la sal que históricamente se usaba para construir postes de cerca y embarcaciones artesanales en las comunidades costeras del Caribe.",
        "location": "Bordes superiores de manglares — playas del Parque Tayrona — orillas de la Ciénaga Grande",
        "androidModel": "Mangle Zaragoza o mangle botón o mangle botoncillo (Conocarpus erectus).glb",
        "iosModel": "Mangle Zaragoza o mangle botón o mangle botoncillo (Conocarpus erectus).usdz"
    },
    {
        "id": "mangle_negro",
        "category": "Mangle",
        "title": "Mangle Negro",
        "scientificName": "Avicennia germinans",
        "tag": "🧂 El Árbol que Suda Sal",
        "description": "El Mangle Negro es un árbol de manglar con un mecanismo único: excreta la sal a través de sus hojas. Tiene raíces especiales llamadas \"neumatóforos\" que sobresalen del suelo fangoso como dedos verticales, permitiéndole respirar en el lodo anaeróbico donde crece.",
        "funFact": "Si lames una hoja de mangle negro, ¡sabe salada! Literalmente \"suda\" sal a través de glándulas especiales en sus hojas. Sus neumatóforos (raíces respiratorias) pueden extenderse hasta 3 metros del tronco, creando un paisaje surreal que parece de otro planeta.",
        "location": "Ciénaga Grande de Santa Marta — bordes de lagunas costeras del Parque Tayrona",
        "androidModel": "Mangle negro o mangle salado (Avicennia germinans).glb",
        "iosModel": "Mangle negro o mangle salado (Avicennia germinans).usdz"
    },
    {
        "id": "mangle_rojo",
        "category": "Mangle",
        "title": "Mangle Rojo",
        "scientificName": "Rhizophora mangle",
        "tag": "🌊 El Caminante del Agua",
        "description": "El Mangle Rojo es un árbol que crece directamente en el agua salada, sostenido por raíces aéreas en forma de zancos que le dan un aspecto único e inconfundible. Sus raíces sumergidas son un hábitat esencial: sirven de guardería para peces juveniles, crustáceos e invertebrados marinos que encuentran refugio entre ellas.",
        "funFact": "Sus raíces filtran hasta el 99% de la sal del agua de mar — un sistema de desalinización natural increíble. Una sola hectárea de manglar rojo puede capturar hasta 10 veces más carbono que una hectárea de bosque tropical terrestre, convirtiéndolo en un superhéroe contra el cambio climático.",
        "location": "Ciénaga Grande de Santa Marta — desembocaduras de ríos del Parque Tayrona",
        "androidModel": "Mangle rojo (Rhizophora mangle).glb",
        "iosModel": "Mangle rojo (Rhizophora mangle).usdz"
    },
    {
        "id": "jaguar",
        "category": "Terrestre",
        "title": "Jaguar",
        "scientificName": "Panthera onca",
        "tag": "👑 Rey de la Selva Americana",
        "description": "El Jaguar es el felino más grande de América y el tercer felino más grande del mundo, después del tigre y el león. Es un depredador tope con la mordida más potente de todos los felinos. Su pelaje dorado con rosetas negras le permite camuflarse perfectamente en la selva tropical de la Sierra Nevada.",
        "funFact": "Su mordida es tan poderosa (2,000 PSI de presión) que puede perforar el caparazón de una tortuga y el cráneo de un caimán. A diferencia de otros felinos grandes, ¡el jaguar ama el agua! Es un excelente nadador que caza peces, caimanes y anacondas en los ríos de la Sierra Nevada.",
        "location": "Selvas del Parque Tayrona — estribaciones de la Sierra Nevada de Santa Marta — corredor biológico hacia la Serranía del Perijá",
        "androidModel": "Jaguar (Panthera onca).glb",
        "iosModel": "Jaguar (Panthera onca).usdz"
    },
    {
        "id": "sapitos_arlequin",
        "category": "Terrestre",
        "title": "Sapito Arlequín",
        "scientificName": "Atelopus sp.",
        "tag": "🎨 Joya Viviente en Peligro",
        "description": "Los Sapitos Arlequín son anfibios pequeños y coloridos en peligro crítico de extinción. Sus colores brillantes (aposemáticos) en combinaciones de negro, amarillo, rojo y verde advierten a los depredadores de su toxicidad. Viven cerca de arroyos cristalinos en los bosques nublados de la Sierra Nevada.",
        "funFact": "Más del 80% de las especies de Atelopus en el mundo están en peligro o ya se han extinto, principalmente por un hongo quítrido que ataca su piel. La Sierra Nevada de Santa Marta alberga especies endémicas únicas de Atelopus que no existen en ningún otro lugar del planeta — proteger este ecosistema es proteger algo irreemplazable.",
        "location": "Bosques nublados y arroyos de montaña de la Sierra Nevada de Santa Marta — entre 1,000 y 3,500 m de altitud",
        "androidModel": "Sapitos arlequín (Atelopus).glb",
        "iosModel": "Sapitos arlequín (Atelopus).usdz"
    }
];
