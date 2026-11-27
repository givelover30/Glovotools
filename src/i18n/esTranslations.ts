// Comprehensive Spanish UI Translations and Domain Terms for CalcTools

import { getESignText } from './esignTranslations.ts';

export const ES_UI_STRINGS: Record<string, string> = {
  // Hero Category Badges
  'hero.cat.calculators': 'Calculadoras',
  'hero.cat.converters': 'Convertidores',
  'hero.cat.checkers': 'Verificadores',
  'hero.cat.generators': 'Generadores',
  'hero.cat.planners': 'Planificadores',
  'hero.cat.tools': 'Herramientas',
  'hero.cat.trackers': 'Seguidores',
  'hero.cat.guides': 'Guías y Referencias',
  'hero.cat.pdfTools': 'Herramientas PDF',
  'hero.cat.docConverters': 'Conversores de Documentos',
  'cat.health': 'Salud y Bienestar',

  // Navigation & Common
  'nav.home': 'Inicio',
  'nav.allTools': 'Todas las Herramientas',
  'nav.categories': 'Categorías',
  'nav.popular': 'Herramientas Populares',
  'nav.popularTools': 'Herramientas Populares',
  'nav.favorites': 'Favoritos',
  'nav.workspace': 'Espacio de trabajo',
  'nav.toolHubs': 'Categorías de Herramientas',
  'nav.guidesArticles': 'Guías y Artículos',
  'nav.resources': 'Recursos',
  'nav.about': 'Acerca de',
  'nav.privacy': 'Privacidad',
  'nav.termsOfUse': 'Términos de Uso',
  'nav.contact': 'Contacto',
  'nav.currency': 'Moneda',
  'nav.language': 'Idioma',
  'hero.title': 'Miles de Herramientas. Una Plataforma.',
  'hero.subtitle': 'Todo lo que necesitas para calcular, convertir y trabajar con PDF — directamente en tu navegador.',
  'hero.searchPlaceholder': 'Buscar calculadoras, PDF, conversores...',
  'hero.suggested': 'Consultas Sugeridas',
  'hero.trending': 'Búsquedas en Tendencia',
  'hero.browseAll': 'Explorar Herramientas',
  'statbar.toolCount': '4.375+ herramientas gratuitas',
  'statbar.catCount': '52 categorías',
  'statbar.langCount': '10 idiomas',
  'statbar.privacyBadge': 'Privado y basado en navegador · Sin registro requerido',
  'statbar.comprehensiveTitle': 'Herramientas Completas',
  'statbar.comprehensiveSub': 'Todo lo que necesitas.',
  'statbar.organizedTitle': 'Organizado por Categoría',
  'statbar.organizedSub': 'Fácil de encontrar y usar.',
  'statbar.freeTitle': 'Siempre Gratis',
  'statbar.freeSub': 'Sin registro requerido.',
  'statbar.privacyTitle': 'Privacidad Primero',
  'statbar.privacySub': 'Tus datos siguen siendo tuyos.',
  'search.placeholder': 'Buscar 360 calculadoras por nombre, palabra clave o fórmula...',
  'btn.viewAll': 'Ver Todo',
  'btn.calculate': 'Calcular',
  'btn.reset': 'Restablecer',
  'btn.share': 'Compartir',
  'btn.save': 'Guardar',
  'btn.favorite': 'Favorito',
  'btn.back': 'Volver',
  'btn.backHome': 'Volver al Inicio',
  'btn.exploreCategories': 'Explorar Todas las Categorías',
  'btn.open': 'Abrir',
  'btn.savePdf': 'Guardar como PDF',
  'btn.copy': 'Copiar',
  'btn.copied': '¡Copiado!',
  'btn.print': 'Imprimir Resultado',
  'btn.close': 'Cerrar',
  'btn.clearRecent': 'Limpiar Historial',

  // Print Document Headings
  'print.generatedOn': 'Calculado el',
  'print.inputs': 'Valores de Entrada',
  'print.results': 'Resultado del Cálculo',
  'print.notes': 'Notas',
  'print.footer': 'Generado con Glovotools · Resumen de cálculo en navegador',
  'print.toastTriggered': 'Diálogo de impresión abierto',

  // Breadcrumbs & Common Labels
  'breadcrumb.home': 'Inicio',
  'breadcrumb.categories': 'Categorías',
  'label.verifiedFormula': 'Resumen de Fórmula',
  'label.privacy': '100% Privacidad en el Cliente',
  'label.formula': 'Fórmula:',
  'label.freeTool': 'Herramienta Gratuita',
  'label.tools': 'herramientas',
  'label.tool': 'herramienta',
  'label.calculators': 'calculadoras',
  'label.calculator': 'calculadora',
  'label.subcategories': 'subcategorías',
  'label.scenario': 'Escenario:',
  'label.sampleInputs': 'Valores de Entrada de Ejemplo:',
  'label.executionSteps': 'Pasos de Ejecución:',
  'label.verifiedSolution': 'Resultado de Ejemplo:',

  // Sections
  'section.popular': 'Calculadoras Populares',
  'section.categories': 'Explorar Calculadoras por Categoría',
  'section.recent': 'Utilizados Recientemente',
  'section.all': 'Todas las Calculadoras Profesionales',
  'section.formula': 'Fórmula y Metodología',
  'section.steps': 'Guía Paso a Paso',
  'section.examples': 'Ejemplo Práctico',
  'section.assumptions': 'Supuestos y Normas de Cálculo',
  'section.mathAssumptions': 'Supuestos Matemáticos',
  'section.limitations': 'Limitaciones del Modelo',
  'section.faq': 'Preguntas Frecuentes',
  'section.additionalInfo': 'Información Adicional',
  'msg.additionalInfoSubtitle': 'Metodología de fórmulas, guías paso a paso, ejemplos, supuestos y preguntas frecuentes',
  'section.related': 'Calculadoras Relacionadas',
  'section.interactiveWorkspace': 'Calculadora Interactiva',
  'section.liveResults': 'Resultados Instantáneos en Vivo',
  'section.inputParameters': 'Parámetros de Entrada',
  'section.calculationResults': 'Resultados del Cálculo',
  'section.breakdown': 'Desglose Detallado',
  'section.formulaExpression': 'Expresión de la Fórmula',
  'section.mathFormula': 'Fórmula Matemática',
  'section.variables': 'Variables y Parámetros',

  // Tables & Headers
  'table.symbol': 'Símbolo',
  'table.parameter': 'Parámetro',
  'table.unit': 'Unidad',
  'table.description': 'Descripción',

  // Messages & Disclaimers
  'msg.loading': 'Cargando calculadora...',
  'msg.invalidInputs': 'Entradas no válidas',
  'msg.checkInputs': 'Por favor, revise sus datos de entrada.',
  'msg.clientEngine': 'Motor de cálculo determinista del cliente',
  'msg.pdfNotice': 'Guarde los resultados del cálculo en PDF al instante',
  'msg.ieeePrecision': 'Todas las operaciones matemáticas se ajustan a las normas de precisión de coma flotante IEEE.',
  'msg.copyLink': 'Copiar Enlace Directo',
  'msg.linkCopied': '¡Enlace Copiado!',
  'msg.shareX': 'Compartir en X',
  'msg.shareFb': 'Facebook',
  'msg.shareLi': 'LinkedIn',
  'msg.shareTitle': 'Compartir Calculadora',
  'msg.noFavorites': 'Aún no tiene calculadoras favoritas',
  'msg.noFavoritesHint': 'Haga clic en la estrella (★) en cualquier calculadora para anclarla aquí y acceder rápidamente.',
  'msg.taglineExtra': '. Cálculos rápidos y precisos ejecutados estrictamente en su dispositivo local sin latencia de servidor ni rastreo de datos.',
  'msg.methodologySubtitle': 'Cómo se deriva y ejecuta este cálculo matemático',
  'msg.faqSubtitle': 'Conceptos clave y orientación práctica para esta calculadora',

  // Disclaimers
  'disclaimer.financial': 'Aviso Financiero y de Préstamos',
  'disclaimer.health': 'Aviso Médico y de Salud',
  'disclaimer.construction': 'Aviso de Estimación de Materiales y Construcción',
  'disclaimer.engineering': 'Cálculos de Ingeniería y Seguridad',
  'disclaimer.standard': 'Supuestos y Normas de Cálculo',

  // Hero
  'hero.badge': 'Herramientas Online Gratuitas',
  'hero.title1': 'Calculadoras Online ',
  'hero.title2': 'Gratuitas',
  'hero.desc': '360 calculadoras de alta precisión para la vida cotidiana, trabajo, finanzas, ingeniería y estudio.',
  'hero.toolboxCategories': 'CATEGORÍAS / TOOLBOX',
  'hero.categoriesAvailable': 'CATEGORÍAS / DISPONIBLES',
  'hero.toolsAvailable': 'HERRAMIENTAS / DISPONIBLES',
  'hero.trendUp': 'Subida de {pct} frente a la versión anterior',
  'hero.trendDown': 'Bajada de {pct} frente a la versión anterior',
  'hero.trendFlat': 'Sin cambios frente a la versión anterior',
  'hero.fast': 'Rápido y Preciso',
  'hero.easy': 'Fácil de Usar',
  'hero.privacy': 'Privacidad Primero',
  'hero.free': '100% Gratis',

  // StatBar
  'stat.calcsTitle': '360 Calculadoras',
  'stat.calcsSub': 'Herramientas para el día a día.',
  'stat.catsTitle': '38 Categorías',
  'stat.catsSub': 'Organizadas por especialidad.',
  'stat.freeTitle': '100% Gratuito',
  'stat.freeSub': 'Sin registro ni suscripciones.',
  'stat.privacyTitle': 'Privacidad Total',
  'stat.privacySub': 'Cálculos en su navegador.',

  // Footer
  'footer.tagline': 'Calculadoras de precisión profesional para matemáticas, ciencias, finanzas, ingeniería y vida cotidiana.',
  'footer.privacyBadge': '100% del lado del cliente • Cero cookies • Matemáticas transparentes',
  'footer.rights': 'Todos los derechos reservados.',
  'footer.quickLinks': 'Enlaces Rápidos',
  'footer.categories': 'Categorías',
  'footer.resources': 'Recursos y Acerca de',
  'footer.aboutLink': 'Acerca de Glovotools',
  'footer.blogLink': 'Guías de Cálculo y Artículos',
  'footer.privacyLink': 'Política de Privacidad y Datos',
  'footer.wcag': 'Conforme a WCAG 2.2 AA',
  'footer.builtWith': 'Desarrollado con precisión y minimalismo',
  'footer.allClient': 'Todos los cálculos se ejecutan localmente en el cliente.',
  'footer.viewAllCategories': 'Ver las 38 Categorías →',

  // All 38 Categories
  'cat.basic-math': 'Matemáticas Básicas',
  'cat.algebra': 'Álgebra',
  'cat.geometry': 'Geometría',
  'cat.trigonometry': 'Trigonometría',
  'cat.statistics': 'Estadística y Probabilidad',
  'cat.scientific': 'Científicas',
  'cat.financial': 'Finanzas',
  'cat.business': 'Negocios y Comercio',
  'cat.construction': 'Construcción y Arquitectura',
  'cat.health-fitness': 'Salud y Bienestar',
  'cat.datetime': 'Fecha y Hora',
  'cat.electrical': 'Electricidad y Electrónica',
  'cat.engineering': 'Ingeniería y Física',
  'cat.everyday': 'Vida Cotidiana',
  'cat.tax-accounting': 'Impuestos y Contabilidad',
  'cat.real-estate': 'Bienes Raíces y Propiedad',
  'cat.ecommerce': 'Comercio Electrónico y Retail',
  'cat.energy-solar': 'Energía Solar y Renovables',
  'cat.insurance-risk': 'Seguros y Gestión de Riesgos',
  'cat.automotive': 'Automotriz y Transporte',
  'cat.education-finance': 'Educación y Finanzas Estudiantiles',
  'cat.salary-compensation': 'Salarios y Compensación',
  'cat.banking-savings': 'Banca y Ahorro',
  'cat.business-operations': 'Operaciones Comerciales',
  'cat.logistics-shipping': 'Logística y Envíos',
  'cat.manufacturing-inventory': 'Manufactura e Inventario',
  'cat.agriculture-farming': 'Agricultura y Cultivos',
  'cat.healthcare-operations': 'Operaciones de Salud',
  'cat.telecom-internet': 'Telecomunicaciones e Internet',
  'cat.personal-productivity': 'Productividad Personal',
  'cat.environmental-sustainability': 'Medio Ambiente y Sostenibilidad',
  'cat.food-service': 'Gastronomía y Hostelería',
  'cat.aviation-transport': 'Aviación y Transporte',
  'cat.cybersecurity-data': 'Ciberseguridad y Datos',
  'cat.legal-compliance': 'Legal y Cumplimiento',
  'cat.real-estate-dev': 'Desarrollo Inmobiliario',
  'cat.retail-supply-chain': 'Cadena de Suministro Retail',
  'cat.sports-athletics': 'Rendimiento Deportivo y Atlético',
  'cat.converter': 'Convertidores y Unidades de Medida',
  'cat.tools': 'Herramientas Digitales y para Desarrolladores',
  'cat.pdf-tools': 'Herramientas PDF',
  'cat.document-converters': 'Convertidores de Documentos',

  // All 119 Subcategories
  'subcat.tools-text': 'Herramientas de Texto',
  'subcat.tools-developer': 'Herramientas para Desarrolladores',
  'subcat.tools-datetime': 'Herramientas de Fecha y Hora',
  'subcat.tools-image': 'Herramientas de Imagen',
  'subcat.tools-file': 'Herramientas de Archivos',
  'subcat.tools-color': 'Herramientas de Color',
  'subcat.tools-web': 'Herramientas Web',
  'subcat.tools-productivity': 'Herramientas de Productividad',
  'subcat.p25-sub-org': 'Organización y Gestión de Páginas PDF',
  'subcat.p25-sub-edit': 'Edición y Diseño de Documentos PDF',
  'subcat.p25-sub-conv': 'Conversión y Optimización PDF',
  'subcat.p25-sub-sec': 'Seguridad y Análisis PDF',
  'subcat.p25-sub-adv': 'Procesamiento PDF Avanzado',
  'subcat.p25-sub-esign': 'Firma Electrónica PDF y Relleno de Formularios',
  'subcat.p27-sub-pdf-to-office': 'Convertidores de PDF a Office',
  'subcat.p27-sub-office-to-pdf': 'Convertidores de Office y Texto a PDF',
  'subcat.p27-sub-web-text-to-pdf': 'Web, Datos y Texto Enriquecido a PDF',
  'subcat.p27-sub-office-formats': 'Convertidores OpenDocument y Formatos Office',
  'subcat.p27-sub-advanced-conv': 'Convertidores Avanzados de Documentos y Marcado',
  'subcat.percentages-fractions': 'Porcentajes y Fracciones',
  'subcat.arithmetic-operations': 'Aritmética y Operaciones',
  'subcat.ratios-proportions': 'Razones y Proporciones',
  'subcat.rounding-estimation': 'Redondeo y Estimación',
  'subcat.quadratic-equations': 'Ecuaciones Cuadráticas',
  'subcat.linear-equations': 'Ecuaciones Lineales',
  'subcat.polynomials-factoring': 'Polinomios y Factorización',
  'subcat.systems-inequalities': 'Sistemas y Desigualdades',
  'subcat.plane-geometry-area': 'Área y Perímetro 2D',
  'subcat.solid-geometry-volume': 'Volumen y Superficie 3D',
  'subcat.circles-arcs': 'Círculos y Arcos',
  'subcat.coordinate-geometry': 'Geometría Analítica',
  'subcat.right-triangles': 'Triángulos Rectángulos y Pitágoras',
  'subcat.trig-functions': 'Funciones Trigonométricas',
  'subcat.oblique-triangles': 'Triángulos Oblicuos',
  'subcat.identities-harmonics': 'Identidades y Fórmulas de Ángulos',
  'subcat.descriptive-statistics': 'Estadística Descriptiva',
  'subcat.combinatorics-probability': 'Combinatoria y Probabilidad',
  'subcat.distributions': 'Distribuciones Estadísticas',
  'subcat.regression-correlation': 'Correlación y Regresión',
  'subcat.powers-exponents': 'Potencias y Exponentes',
  'subcat.logarithms': 'Logaritmos',
  'subcat.precision-scientific': 'Motor Científico de Precisión',
  'subcat.constants-sequences': 'Constantes y Secuencias',
  'subcat.loans-mortgages': 'Préstamos e Hipotecas',
  'subcat.compound-investments': 'Interés Compuesto e Inversiones',
  'subcat.retirement-savings': 'Jubilación y Ahorro',
  'subcat.depreciation-tax': 'Depreciación y Capital',
  'subcat.break-even-analysis': 'Análisis de Punto de Equilibrio',
  'subcat.profit-margins-markup': 'Márgenes de Beneficio y Margen Comercial',
  'subcat.roi-npv': 'ROI y Retorno de Inversión',
  'subcat.valuation-ratios': 'Ratios y Métricas Financieras',
  'subcat.concrete-masonry': 'Concreto y Mampostería',
  'subcat.flooring-materials': 'Pisos y Azulejos',
  'subcat.framing-lumber': 'Estructuras y Madera',
  'subcat.paint-roofing': 'Pintura y Recubrimientos',
  'subcat.body-composition': 'Composición Corporal y Masa',
  'subcat.metabolic-energy': 'Tasa Metabólica y Energía',
  'subcat.target-heart-rate': 'Frecuencia Cardíaca Objetivo',
  'subcat.macronutrients-nutrition': 'Macronutrientes y Nutrición',
  'subcat.chronological-age': 'Edad Cronológica',
  'subcat.date-math-differences': 'Diferencias y Operaciones con Fechas',
  'subcat.business-working-days': 'Días Hábiles y Laborales',
  'subcat.time-durations': 'Duraciones de Tiempo y Reloj',
  'subcat.ohms-law-power': 'Ley de Ohm y Potencia',
  'subcat.energy-consumption': 'Consumo de Energía y Costos',
  'subcat.wire-sizing-drop': 'Caída de Tensión y Calibre de Cable',
  'subcat.circuits-impedance': 'Circuitos Serie y Paralelo',
  'subcat.hydraulics-fluid': 'Hidráulica y Energía de Fluidos',
  'subcat.mechanics-energy': 'Mecánica y Energía',
  'subcat.structural-beam': 'Mecánica de Vigas Estructurales',
  'subcat.thermodynamics': 'Termodinámica y Calor',
  'subcat.dining-tipping': 'Comidas y División de Propinas',
  'subcat.shopping-discounts': 'Descuentos de Compras e Impuestos',
  'subcat.automotive-fuel': 'Economía de Combustible y Costo de Viaje',
  'subcat.cooking-baking-ratios': 'Ratios de Recetas y Repostería',
  'subcat.income-taxes': 'Impuestos sobre la Renta y Federales',
  'subcat.sales-vat': 'Impuesto sobre Ventas y IVA',
  'subcat.self-employment-tax': 'Autoempleo y FICA',
  'subcat.mortgages-loans': 'Hipotecas y Préstamos de Vivienda',
  'subcat.investment-roi': 'Inversión y ROI de Alquiler',
  'subcat.rent-vs-buy': 'Análisis de Alquilar vs Comprar',
  'subcat.marketplace-fees': 'Tarifas de Marketplace y FBA',
  'subcat.pricing-margins': 'Precios y Márgenes de Beneficio',
  'subcat.retail-break-even': 'Punto de Equilibrio Minorista',
  'subcat.solar-systems': 'Sistemas de Paneles Solares',
  'subcat.life-health-risk': 'Riesgo de Vida y Salud',
  'subcat.property-casualty': 'Deducibles de Propiedad y Accidentes',
  'subcat.vehicle-financing': 'Financiamiento y Depreciación de Vehículos',
  'subcat.transport-travel': 'Transporte y Viajes por Carretera',
  'subcat.student-loans': 'Préstamos Estudiantiles y Amortización',
  'subcat.college-savings': 'Ahorro Universitario y Planes 529',
  'subcat.salary-conversion': 'Conversión de Salario y Salario por Hora',
  'subcat.paycheck-net-pay': 'Salario Neto y Bonificaciones',
  'subcat.retirement-growth': 'Crecimiento de Jubilación 401(k) y Aporte Patronal',
  'subcat.deposit-accounts': 'Cuentas de Depósito y CD',
  'subcat.savings-accumulation': 'Acumulación y Crecimiento de Ahorros',
  'subcat.saas-unit-economics': 'Economía Unitaria SaaS',
  'subcat.human-resources': 'Recursos Humanos y Retención',
  'subcat.freight-parcel': 'Envíos de Carga y Paquetería',
  'subcat.inventory-management': 'Gestión de Inventario y EOQ',
  'subcat.plant-operations': 'Operaciones de Planta y OEE',
  'subcat.crop-management': 'Rendimiento de Cultivos y Cosecha',
  'subcat.soil-nutrients': 'Nutrientes del Suelo y Fertilizantes N-P-K',
  'subcat.clinic-management': 'Tiempos de Espera y Rendimiento Clínico',
  'subcat.clinical-admin': 'Administración Clínica y Goteos IV',
  'subcat.network-performance': 'Rendimiento de Red y Ancho de Banda',
  'subcat.time-management': 'Gestión del Tiempo y Planificación Pomodoro',
  'subcat.personal-wellness': 'Bienestar Personal e Hidratación',
  'subcat.personal-finance': 'Finanzas Personales y Patrimonio Neto',
  'subcat.goal-tracking': 'Seguimiento de Metas y Hábitos',
  'subcat.carbon-accounting': 'Contabilidad de Carbono y Emisiones',
  'subcat.renewable-offset': 'Compensación Renovable y Ahorro Solar',
  'subcat.menu-costing': 'Costeo de Menús y Precios de Recetas',
  'subcat.restaurant-operations': 'Operaciones de Restaurantes y Rotación de Mesas',
  'subcat.flight-navigation': 'Navegación de Vuelo y Velocidad Aerodinámica',
  'subcat.flight-planning': 'Consumo de Combustible y Planificación de Alcance',
  'subcat.information-security': 'Seguridad de la Información y Contraseñas',
  'subcat.cloud-infrastructure': 'Infraestructura en la Nube y Costos de Almacenamiento',
  'subcat.data-storage': 'Almacenamiento de Datos y Tolerancia RAID',
  'subcat.datacenter-efficiency': 'Eficiencia de Centros de Datos y PUE',
  'subcat.contract-law': 'Derecho de Contratos y Daños por NDA',
  'subcat.data-privacy': 'Privacidad de Datos y Cumplimiento GDPR',
  'subcat.commercial-re': 'Bienes Raíces Comerciales y Cap Rate',
  'subcat.property-dev': 'Desarrollo Inmobiliario y Residuo de Terreno',
  'subcat.retail-inventory': 'Planificación Minorista Open-to-Buy',
  'subcat.inventory-risk': 'Costo de Desabastecimiento y Ventas Perdidas',
  'subcat.endurance-running': 'Carrera de Resistencia y Predicción de Carreras',
  'subcat.cycling-power': 'FTP de Ciclismo y Zonas de Entrenamiento',
  'subcat.swimming': 'Ritmo de Natación y Velocidad Crítica',
  'subcat.baseball-stats': 'Sabermetría de Béisbol y Estadísticas Ofensivas',
  'subcat.universal-conversions': 'Universal y Multiunidades',
  'subcat.length-distance': 'Longitud y Distancia',
  'subcat.mass-weight': 'Peso y Masa',
  'subcat.temperature-units': 'Temperatura',
  'subcat.volume-capacity': 'Volumen y Capacidad',
  'subcat.area-surface': 'Área y Superficie de Terreno',
  'subcat.digital-storage': 'Almacenamiento y Datos Digitales',
  'subcat.speed-velocity': 'Velocidad',
  'subcat.pressure-stress': 'Presión y Tensión',
  'subcat.energy-power': 'Energía y Potencia',
};

// Domain terms dictionary for translating input labels, descriptions, units, and result labels
export const ES_TERMS: Record<string, string> = {
  // Common Inputs
  'Numerator 1': 'Numerador 1',
  'Denominator 1': 'Denominador 1',
  'Numerator 2': 'Numerador 2',
  'Denominator 2': 'Denominador 2',
  'Operation': 'Operación',
  'Add (+)': 'Sumar (+)',
  'Subtract (-)': 'Restar (-)',
  'Multiply (×)': 'Multiplicar (×)',
  'Divide (÷)': 'Dividir (÷)',
  'Initial Value': 'Valor Inicial',
  'Final Value': 'Valor Final',
  'Base Value': 'Valor Base',
  'Rate': 'Tasa',
  'Percentage': 'Porcentaje',
  'Principal': 'Capital Inicial',
  'Principal Amount': 'Monto del Capital',
  'Loan Amount': 'Monto del Préstamo',
  'Interest Rate': 'Tasa de Interés',
  'Annual Interest Rate': 'Tasa de Interés Anual',
  'Loan Term': 'Plazo del Préstamo',
  'Loan Term (Years)': 'Plazo del Préstamo (Años)',
  'Loan Term (Months)': 'Plazo del Préstamo (Meses)',
  'Compounding Frequency': 'Frecuencia de Capitalización',
  'Monthly Payment': 'Pago Mensual',
  'Total Interest': 'Interés Total',
  'Total Payment': 'Pago Total Total',
  'Down Payment': 'Pago Inicial (Enganche)',
  'Property Value': 'Valor de la Propiedad',
  'Annual Property Tax': 'Impuesto Predial Anual',
  'Home Insurance': 'Seguro de Hogar',
  'Monthly HOA Fees': 'Cuotas de Mantenimiento',
  'Height': 'Altura',
  'Weight': 'Peso',
  'Age': 'Edad',
  'Gender': 'Género',
  'Male': 'Masculino',
  'Female': 'Femenino',
  'Activity Level': 'Nivel de Actividad',
  'Sedentary': 'Sedentario',
  'Lightly Active': 'Ligeramente Activo',
  'Moderately Active': 'Moderadamente Activo',
  'Very Active': 'Muy Activo',
  'Extremely Active': 'Extremadamente Activo',
  'Birth Date': 'Fecha de Nacimiento',
  'Target Date': 'Fecha Objetivo',
  'Start Date': 'Fecha de Inicio',
  'End Date': 'Fecha de Fin',
  'Years': 'Años',
  'Months': 'Meses',
  'Days': 'Días',
  'Hours': 'Horas',
  'Minutes': 'Minutos',
  'Seconds': 'Segundos',
  'Voltage': 'Voltaje',
  'Current': 'Corriente',
  'Resistance': 'Resistencia',
  'Power': 'Potencia',
  'Length': 'Longitud',
  'Width': 'Ancho',
  'Height / Depth': 'Altura / Profundidad',
  'Depth': 'Profundidad',
  'Thickness': 'Grosor',
  'Radius': 'Radio',
  'Diameter': 'Diámetro',
  'Circumference': 'Circunferencia',
  'Area': 'Área',
  'Perimeter': 'Perímetro',
  'Volume': 'Volumen',
  'Quantity': 'Cantidad',
  'Cost per Unit': 'Costo por Unidad',
  'Price per Unit': 'Precio por Unidad',
  'Discount Percentage': 'Porcentaje de Descuento',
  'Sales Tax Rate': 'Tasa de Impuesto a las Ventas',
  'Tip Percentage': 'Porcentaje de Propina',
  'Number of People': 'Número de Personas',
  'Bill Amount': 'Total de la Cuenta',
  'Revenue': 'Ingresos',
  'Variable Cost per Unit': 'Costo Variable por Unidad',
  'Fixed Costs': 'Costos Fijos',
  'Gross Profit': 'Ganancia Bruta',
  'Net Profit': 'Ganancia Neta',
  'Cost of Goods Sold': 'Costo de Ventas (COGS)',
  'Cash Flow': 'Flujo de Efectivo',
  'Discount Rate': 'Tasa de Descuento',
  'Distance': 'Distancia',
  'Speed': 'Velocidad',
  'Time': 'Tiempo',
  'Fuel Efficiency': 'Rendimiento de Combustible',
  'Gas Price': 'Precio del Combustible',

  // Common Results & Units
  'Result Fraction': 'Fracción Resultante',
  'Decimal Equivalent': 'Equivalente Decimal',
  'Step-by-Step Solution': 'Solución Paso a Paso',
  'Percentage Change': 'Variación Porcentual',
  'Absolute Difference': 'Diferencia Absoluta',
  'Body Mass Index': 'Índice de Masa Corporal',
  'BMI Category': 'Categoría de IMC',
  'Healthy Weight Range': 'Rango de Peso Saludable',
  'BMR': 'Tasa Metabólica Basal (BMR)',
  'TDEE': 'Gasto Energético Total (TDEE)',
  'Calorie Deficit': 'Déficit Calórico',
  'Calorie Surplus': 'Superávit Calórico',
  'Exact Age': 'Edad Exacta',
  'Total Days Lived': 'Días Totales Vividos',
  'Next Birthday In': 'Próximo Cumpleaños En',
  'Total Days': 'Días Totales',
  'Business Days': 'Días Hábiles',
  'Weekend Days': 'Días de Fin de Semana',
  'Break-Even Units': 'Unidades para Punto de Equilibrio',
  'Break-Even Revenue': 'Ventas para Punto de Equilibrio',
  'Margin Percentage': 'Margen Porcentual',
  'Markup Percentage': 'Porcentaje de Recargo',
  'Net Present Value': 'Valor Presente Neto',
  'Internal Rate of Return': 'Tasa Interna de Retorno',
  'Return on Investment': 'Retorno de Inversión (ROI)',
  'Amortization Payment': 'Pago Periódico',
  'Tip Amount': 'Monto de la Propina',
  'Total per Person': 'Total por Persona',
  'Total with Tip': 'Total con Propina',
  'Total Savings': 'Ahorro Total',
  'Tax Amount': 'Monto de Impuesto',
  'Final Price': 'Precio Final',
  'Electric Current': 'Corriente Eléctrica',
  'Electrical Resistance': 'Resistencia Eléctrica',
  'Electric Power': 'Potencia Eléctrica',
  'Total Energy Cost': 'Costo Total de Energía',
  'Annual Energy Cost': 'Costo Anual de Energía',
  'Daily Energy Use': 'Consumo Diario de Energía',
  'Surface Area': 'Área Superficial',
  'Hypotenuse': 'Hipotenusa',
  'Opposite Side': 'Cateto Opuesto',
  'Adjacent Side': 'Cateto Adyacente',
  'Angle θ': 'Ángulo θ',
  'Mean': 'Media Aritmética',
  'Median': 'Mediana',
  'Mode': 'Moda',
  'Standard Deviation': 'Desviación Estándar',
  'Variance': 'Varianza',
  'Sample Size': 'Tamaño de Muestra',
  'Confidence Interval': 'Intervalo de Confianza',
  'Z-Score': 'Puntuación Z',
  'Probability': 'Probabilidad',
};

// Translates any domain label, input title, or output phrase dynamically
export function translateTerm(term: string, language: string): string {
  if (language !== 'es' || !term) return term;

  const trimmed = term.trim();
  if (ES_TERMS[trimmed]) return ES_TERMS[trimmed];

  // Try case-insensitive lookup
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(ES_TERMS)) {
    if (key.toLowerCase() === lower) return val;
  }

  // Common phrase transformations
  let result = trimmed;
  result = result.replace(/\bCalculator\b/gi, 'Calculadora')
    .replace(/\bCalculations\b/gi, 'Cálculos')
    .replace(/\bCalculation\b/gi, 'Cálculo')
    .replace(/\bSolver\b/gi, 'Solucionador')
    .replace(/\bEstimator\b/gi, 'Estimador')
    .replace(/\bConverter\b/gi, 'Convertidor')
    .replace(/\bTotal\b/gi, 'Total')
    .replace(/\bAmount\b/gi, 'Monto')
    .replace(/\bRate\b/gi, 'Tasa')
    .replace(/\bPrice\b/gi, 'Precio')
    .replace(/\bCost\b/gi, 'Costo')
    .replace(/\bPayment\b/gi, 'Pago')
    .replace(/\bInterest\b/gi, 'Interés')
    .replace(/\bValue\b/gi, 'Valor')
    .replace(/\bPeriod\b/gi, 'Período')
    .replace(/\bAnnual\b/gi, 'Anual')
    .replace(/\bMonthly\b/gi, 'Mensual')
    .replace(/\bDaily\b/gi, 'Diario')
    .replace(/\bYears\b/gi, 'Años')
    .replace(/\bMonths\b/gi, 'Meses')
    .replace(/\bDays\b/gi, 'Días')
    .replace(/\bHours\b/gi, 'Horas')
    .replace(/\bPercentage\b/gi, 'Porcentaje')
    .replace(/\bFormula\b/gi, 'Fórmula')
    .replace(/\bResult\b/gi, 'Resultado')
    .replace(/\bInput\b/gi, 'Entrada')
    .replace(/\bOutput\b/gi, 'Salida')
    .replace(/\bStep\b/gi, 'Paso')
    .replace(/\bSummary\b/gi, 'Resumen')
    .replace(/\bBreakdown\b/gi, 'Desglose')
    .replace(/\bMethodology\b/gi, 'Metodología')
    .replace(/\bAssumptions\b/gi, 'Supuestos')
    .replace(/\bLimitations\b/gi, 'Limitaciones');

  return result;
}

import { getLocalizedCategory as baseGetLocalizedCategory, getLocalizedSubcategory as baseGetLocalizedSubcategory } from './translations.ts';

export function getLocalizedCategory(cat: any, language: string) {
  return baseGetLocalizedCategory(cat, language);
}

export function getLocalizedSubcategory(subcat: any, language: string) {
  return baseGetLocalizedSubcategory(subcat, language);
}


// Map of curated titles and descriptions for top calculators
export const ES_CALCULATOR_OVERRIDES: Record<string, { name: string; description: string }> = {
  'bmi': { name: 'Calculadora de IMC', description: 'Índice de masa corporal y clasificación de peso saludable.' },
  'loan-mortgage': { name: 'Calculadora de Préstamo e Hipoteca', description: 'Cuota mensual, interés total y tabla de amortización completa.' },
  'area-shapes': { name: 'Calculadora de Área y Perímetro', description: 'Cálculo de área y perímetro de formas geométricas en 2D.' },
  'exact-age': { name: 'Calculadora de Edad Exacta', description: 'Edad exacta en años, meses, días y cuenta regresiva para el próximo cumpleaños.' },
  'fraction-arithmetic': { name: 'Aritmética de Fracciones', description: 'Suma, resta, multiplicación y división de fracciones con reducción paso a paso.' },
  'percent-change': { name: 'Variación Porcentual', description: 'Cálculo de crecimiento relativo, cambio porcentual y tasa de rebaja.' },
  'proportion-solver': { name: 'Solucionador de Proporciones', description: 'Resolver término faltante en fracciones equivalentes A/B = C/D.' },
  'average-calculator': { name: 'Promedio y Media Aritmética', description: 'Calcular promedio, suma total, conteo y rango de secuencias numéricas.' },
  'linear-equation': { name: 'Ecuación Lineal (ax + b = c)', description: 'Resolver ecuaciones lineales de una variable con aislamiento paso a paso.' },
  'two-variable-linear': { name: 'Sistemas de Ecuaciones 2x2', description: 'Resolver sistemas de ecuaciones lineales simultáneas mediante sustitución o eliminación.' },
  'factoring-trinomials': { name: 'Factorización de Trinomios', description: 'Factorizar trinomios cuadráticos ax² + bx + c en productos binomiales.' },
  'distance-2d': { name: 'Distancia en Coordenadas 2D', description: 'Distancia euclidiana y ángulo de pendiente entre dos puntos cartesianos.' },
  'circle-calculator': { name: 'Área y Circunferencia del Círculo', description: 'Radio, diámetro, circunferencia y área plana del círculo.' },
  'triangle-area': { name: 'Área del Triángulo (Fórmula de Herón)', description: 'Calcular área usando base/altura o 3 lados mediante la fórmula de Herón.' },
  'rectangular-prism': { name: 'Prisma Rectangular (Caja)', description: 'Volumen, área superficial total y diagonal 3D del ortoedro.' },
  'cylinder-calc': { name: 'Volumen y Superficie de Cilindro', description: 'Volumen de cilindro circular recto, área lateral y área superficial total.' },
  'sphere-calc': { name: 'Volumen y Superficie de Esfera', description: 'Volumen de esfera sólida y área superficial curva.' },
  'right-triangle-solver': { name: 'Resolución de Triángulo Rectángulo', description: 'Resolver lados, ángulos, área e hipotenusa a partir de 2 entradas.' },
  'law-of-sines': { name: 'Ley de los Senos', description: 'Resolver triángulos oblicuos usando la regla de proporción de senos.' },
  'law-of-cosines': { name: 'Ley de los Cosenos', description: 'Resolver triángulos oblicuos SAS y SSS usando la regla del coseno.' },
  'standard-deviation': { name: 'Desviación Estándar', description: 'Desviación estándar muestral y poblacional, media y dispersión.' },
  'mean-median-mode': { name: 'Media, Mediana y Moda', description: 'Medidas completas de tendencia central para conjuntos de datos numéricos.' },
  'weighted-average': { name: 'Promedio Ponderado', description: 'Calcular calificación ponderada a partir de valores y ponderaciones porcentuales.' },
  'z-score': { name: 'Puntuación Z (Puntuación Estándar)', description: 'Estandarizar distancia de observación respecto a la media en desviaciones estándar.' },
  'combinations-calc': { name: 'Calculadora de Combinaciones (nCr)', description: 'Calcular subconjuntos desordenados n eligen r sin repetición.' },
  'probability-calc': { name: 'Probabilidad de Eventos', description: 'Evaluar resultados favorables vs totales, porcentaje y probabilidades a favor.' },
  'confidence-interval': { name: 'Intervalo de Confianza', description: 'Calcular márgenes de confianza del 90%, 95% y 99% para una media muestral.' },
  'scientific-notation': { name: 'Notación Científica', description: 'Convertir números grandes y pequeños en notación científica (m × 10ⁿ) y E.' },
  'logarithm-base-n': { name: 'Logaritmos (Cualquier Base)', description: 'Evaluar log_b(x) usando la fórmula de cambio de base.' },
  'exponential-growth': { name: 'Crecimiento y Decaimiento Exponencial', description: 'Modelar crecimiento poblacional continuo y tasa de decaimiento.' },
  'auto-loan-calc': { name: 'Préstamo de Automóvil', description: 'Calcular pagos mensuales de autos, interés total y costo de financiamiento.' },
  'extra-payment-calc': { name: 'Pago Extra de Hipoteca', description: 'Ver cómo pagos adicionales de capital acortan su préstamo y reducen intereses.' },
  'simple-interest-calc': { name: 'Interés Simple', description: 'Calcular interés no compuesto ganado o pagado: I = P × r × t.' },
  'apr-to-apy-calc': { name: 'Convertidor de APR a APY', description: 'Convertir Tasa Porcentual Anual nominal (APR) en Rendimiento Anual Efectivo (APY).' },
  'rule-of-72-calc': { name: 'Regla del 72', description: 'Estimar años o tasa de interés requerida para duplicar su riqueza invertida.' },
  '401k-savings-calc': { name: 'Planificador de Jubilación 401(k)', description: 'Proyectar saldo de jubilación 401(k) incluyendo contribución de la empresa.' },
  'roth-ira-calc': { name: 'Crecimiento de Roth IRA', description: 'Pronosticar crecimiento compuesto libre de impuestos y saldo de retiro.' },
  'safe-withdrawal-rate-calc': { name: 'Tasa de Retiro Seguro (Regla del 4%)', description: 'Determinar gasto anual de retiro sostenible a partir del fondo acumulado.' },
  'fire-calculator': { name: 'Calculadora FIRE (Independencia Financiera)', description: 'Calcular su número FIRE objetivo exacto y años estimados hasta retiro temprano.' },
  'straight-line-depreciation-calc': { name: 'Depreciación Línea Recta', description: 'Calcular amortización anual igual de activos: (Costo - Valor Residual) / Vida Útil.' },
  'capital-gains-tax-calc': { name: 'Impuesto sobre Ganancias de Capital', description: 'Calcular ganancias netas gravables e impuesto estimado en venta de inversiones.' },
  'effective-tax-rate-calc': { name: 'Tasa Impositiva Efectiva', description: 'Calcular porcentaje real de ingresos totales pagados en impuestos.' },
  'net-paycheck-calc': { name: 'Calculadora de Salario Neto', description: 'Estimar salario neto de bolsillo después de impuestos federales, estatales y deducciones.' },
  'target-profit-calc': { name: 'Ventas para Beneficio Objetivo', description: 'Calcular volumen de unidades y ingresos requeridos para lograr ganancia objetivo.' },
  'contribution-margin-calc': { name: 'Margen de Contribución', description: 'Calcular margen de contribución en dólares y porcentaje de razón.' },
  'markup-to-margin-calc': { name: 'Conversión de Margen a Ganancia', description: 'Convertir porcentaje de recargo de costo a margen de ganancia bruta.' },
  'ebitda-margin-calc': { name: 'Margen EBITDA', description: 'Calcular ganancias en efectivo EBITDA y porcentaje de rentabilidad operativa.' },
  'gross-margin-pricing-calc': { name: 'Precio de Margen Bruto Objetivo', description: 'Calcular precio de venta minorista exacto para alcanzar margen bruto objetivo.' },
  'npv-calculator': { name: 'Valor Presente Neto (VPN)', description: 'Evaluar rentabilidad de proyectos descontando flujos de caja plurianuales.' },
  'irr-calculator': { name: 'Tasa Interna de Retorno (TIR)', description: 'Determinar tasa de descuento anualizada donde el valor presente neto es cero.' },
  'annualized-roi-calc': { name: 'ROI Anualizado y CAGR', description: 'Calcular Tasa de Crecimiento Anual Compuesta (CAGR) y retorno de inversión.' },
  'customer-acquisition-cost-calc': { name: 'Costo de Adquisición de Clientes (CAC)', description: 'Calcular CAC y ratio de viabilidad de negocio LTV:CAC.' },
  'churn-rate-calc': { name: 'Tasa de Cancelación y Retención', description: 'Calcular porcentaje de rotación periódica y vida útil promedio de clientes.' },
  'concrete-footing-calc': { name: 'Zapatas y Pilares de Concreto', description: 'Calcular yardas cúbicas y sacos de premezcla para cimientos corridos y zapatas.' },
  'cinder-block-calc': { name: 'Muro de Bloques de Concreto', description: 'Estimar bloques de mampostería estándar 8x8x16 y sacos de mortero.' },
  'gravel-aggregate-calc': { name: 'Grava y Piedra Triturada', description: 'Determinar yardas cúbicas y toneladas de agregado para relleno de entradas.' },
  'hardwood-flooring-calc': { name: 'Pisos de Madera y Laminados', description: 'Calcular pies cuadrados totales, margen de desperdicio (10%) y cajas.' },
  'tile-grout-calc': { name: 'Azulejos y Volumen de Lechada', description: 'Calcular número de piezas de azulejo y kilos de lechada según juntas.' },
  'vinyl-plank-calc': { name: 'Pisos de Vinilo de Lujo (LVP)', description: 'Calcular cajas de LVP y pies cuadrados requeridos con desperdicio.' },
  'deck-boards-calc': { name: 'Tableros y Fijaciones para Terraza', description: 'Calcular tablas de terraza y tornillos ocultos.' },
  'wall-stud-calc': { name: 'Montantes de Pared (Studs)', description: 'Calcular montantes de estructura 2x4 / 2x6 (16" o 24" O.C.) y soleras.' },
  'drywall-sheet-calc': { name: 'Paneles de Yeso (Drywall)', description: 'Estimar paneles de 4x8 o 4x12, tornillos y compuesto para juntas.' },
  'board-feet-calc': { name: 'Pies Tabulares de Madera', description: 'Calcular volumen de madera dura: (Grosor × Ancho × Largo) / 12.' },
  'stair-rise-run-calc': { name: 'Contrahuella y Huella de Escalera', description: 'Calcular número exacto de escalones, altura de contrahuella y profundidad.' },
  'fence-picket-calc': { name: 'Estacas y Postes de Cerca', description: 'Estimar postes 4x4, rieles 2x4 y estacas de privacidad.' },
  'interior-paint-calc': { name: 'Pintura para Paredes Interiores', description: 'Calcular área neta de paredes y galones de pintura necesarios.' },
  'roof-shingle-calc': { name: 'Tejas de Techo y Paquetes', description: 'Estimar cuadrados de techo y tejas asfálticas.' },
  'roof-pitch-calc': { name: 'Pendiente e Inclinación de Techo', description: 'Convertir relación de pendiente (ej. 6:12) a ángulo multiplicador.' },
  'mulch-landscaping-calc': { name: 'Mulch y Tierra para Paisajismo', description: 'Calcular yardas cúbicas y sacos de mulch para cobertura de jardín.' },
  'universal-unit-converter': { name: 'Convertidor Universal de Unidades y Matriz Comparativa', description: 'Conversión instantánea multiunidad y matriz comparativa en tiempo real para todas las dimensiones de medida.' },
  'length-converter': { name: 'Convertidor de Longitud y Distancia', description: 'Conversión entre unidades métricas e imperiales: metros, kilómetros, pies, pulgadas, yardas y millas.' },
  'weight-mass-converter': { name: 'Convertidor de Peso y Masa', description: 'Conversión entre masa métrica e imperial: kilogramos, libras (lbs), gramos, onzas, piedras y toneladas.' },
  'temperature-converter': { name: 'Convertidor de Temperatura (°C, °F, K)', description: 'Conversión entre escalas térmicas Celsius (°C), Fahrenheit (°F) y Kelvin (K).' },
  'volume-converter': { name: 'Convertidor de Volumen y Capacidad Líquida', description: 'Conversión de capacidad de fluidos: litros, mililitros, galones estadounidenses e imperiales, metros cúbicos y onzas líquidas.' },
  'area-converter': { name: 'Convertidor de Área y Terreno', description: 'Conversión de superficies y áreas de terreno: metros cuadrados, pies cuadrados, acres, hectáreas y kilómetros cuadrados.' },
  'digital-storage-converter': { name: 'Convertidor de Almacenamiento Digital y Bytes', description: 'Conversión de almacenamiento digital: Bytes, Kilobytes, Megabytes, Gigabytes, Terabytes, Petabytes y Bits.' },
  'speed-converter': { name: 'Convertidor de Velocidad', description: 'Conversión de velocidad: kilómetros por hora (km/h), millas por hora (mph), metros por segundo y nudos.' },
  'pressure-converter': { name: 'Convertidor de Presión y Tensión Atmosférica', description: 'Conversión de presión: Pascales (Pa), Kilopascales (kPa), Bares, PSI y Atmósferas estándar (atm).' },
  'time-frequency-converter': { name: 'Convertidor de Tiempo y Frecuencia', description: 'Conversión de duraciones temporales: segundos, minutos, horas, días, semanas, meses, años y hercios (Hz).' },
  'word-character-counter': { name: 'Contador de Palabras, Caracteres y Tiempo de Lectura', description: 'Conteo instantáneo de palabras, caracteres, oraciones y duración estimada de lectura y locución.' },
  'case-converter-tool': { name: 'Convertidor de Mayúsculas, Minúsculas y Casing', description: 'Transformación entre MAYÚSCULAS, minúsculas, Title Case, camelCase, snake_case y kebab-case.' },
  'lorem-ipsum-generator': { name: 'Generador de Texto de Relleno Lorem Ipsum', description: 'Generación de texto de prueba por párrafos, oraciones o recuento de palabras para maquetación.' },
  'json-formatter-validator': { name: 'Formateador, Minificador y Validador de JSON', description: 'Validación de sintaxis en tiempo real, embellecimiento con 2 o 4 espacios y minificación.' },
  'base64-encoder-decoder': { name: 'Codificador y Decodificador Base64 y URL-Safe', description: 'Codifique texto UTF-8 a Base64 o decodifique cadenas Base64 con compatibilidad URL-Safe.' },
  'hash-generator-tool': { name: 'Generador de Hashes Criptográficos (SHA-256 / SHA-512)', description: 'Cálculo determinista de sumas de comprobación SHA-256, SHA-512 y SHA-1 en el navegador.' },
  'regex-tester-tool': { name: 'Probador de Expresiones Regulares (RegExp Matcher)', description: 'Pruebe patrones RegExp con banderas (g, i, m, s), recuento de coincidencias y grupos de captura.' },
  'unix-timestamp-converter': { name: 'Convertidor de Timestamp Unix y Fecha Epoch', description: 'Conversión entre segundos epoch de Unix y fechas legibles en formatos UTC y local.' },
  'aspect-ratio-calculator': { name: 'Calculadora de Relación de Aspecto (16:9, 4:3, 1:1)', description: 'Cálculo de dimensiones proporcionales y resolución escalada para imágenes y videos.' },
  'file-size-bandwidth-tool': { name: 'Calculadora de Tiempo de Descarga y Ancho de Banda', description: 'Estimación del tiempo de transferencia de archivos a través de conexiones de banda ancha, 5G y Gigabit.' },
  'color-converter-picker': { name: 'Convertidor de Color HEX, RGB, HSL y CMYK con WCAG', description: 'Conversión entre espacios de color con selector interactivo y evaluación de contraste de accesibilidad.' },
  'url-encoder-decoder': { name: 'Codificador y Decodificador de URL (Percent-Encoding)', description: 'Codifique parámetros de consulta URI según RFC 3986 o decodifique cadenas codificadas.' },
  'html-entity-converter': { name: 'Convertidor de Entidades HTML (Encoder / Decoder)', description: 'Transformación de caracteres especiales a entidades HTML (&amp;, &lt;, &gt;) y viceversa.' },
  'qr-code-payload-generator': { name: 'Generador de Cargas Útiles para Códigos QR y Wi-Fi', description: 'Formateo de esquemas estándar para URLs, credenciales de redes Wi-Fi, textos y correos.' }
};

export function getLocalizedCalculator(calc: any, language: string) {
  if (
    calc &&
    (calc.id === 'sign-pdf' ||
      calc.id === 'create-signature' ||
      calc.id === 'fill-and-sign' ||
      calc.id === 'add-date-initials')
  ) {
    const titleKeyMap = {
      'sign-pdf': 'esign.tool.signPdf',
      'create-signature': 'esign.tool.createSignature',
      'fill-and-sign': 'esign.tool.fillAndSign',
      'add-date-initials': 'esign.tool.addDateInitials',
    } as const;
    const id = calc.id as keyof typeof titleKeyMap;
    return {
      ...calc,
      name: getESignText(language as Parameters<typeof getESignText>[0], titleKeyMap[id]),
    };
  }
  if (language === 'es') {
    const override = ES_CALCULATOR_OVERRIDES[calc.id];
    if (override) {
      return {
        ...calc,
        name: override.name,
        shortDesc: override.description,
      };
    }
    return {
      ...calc,
      name: calc.name.replace(/Calculator/gi, 'Calculadora').replace(/Solver/gi, 'Solucionador').replace(/Converter/gi, 'Convertidor'),
      shortDesc: calc.shortDesc.replace(/Calculate/gi, 'Calcula').replace(/Compute/gi, 'Calcula').replace(/Determine/gi, 'Determina'),
    };
  }
  return calc;
}

// Localizes the 6 documentation sections for any calculator
export function getLocalizedCalculatorDetail(detail: any, meta: any, language: string) {
  if (language !== 'es' || !detail) return detail;

  const calcName = getLocalizedCalculator(meta || { id: detail.id, name: 'Calculadora', shortDesc: '' }, 'es').name;

  return {
    ...detail,
    formulaName: `Modelo Matemático de ${calcName}`,
    variables: (detail.variables || []).map((v: any) => ({
      ...v,
      name: translateTerm(v.name, 'es'),
      description: translateTerm(v.description, 'es'),
    })),
    methodology: (detail.methodology || []).map((step: string) => {
      return step
        .replace(/Parse validated input fields for/gi, 'Analizar los campos de entrada validados para')
        .replace(/Apply formula expression:/gi, 'Aplicar la expresión de la fórmula:')
        .replace(/Compute results with high precision\./gi, 'Calcular los resultados con alta precisión.')
        .replace(/Format output according to/gi, 'Formatear la salida de acuerdo con los estándares de')
        .replace(/standards\./gi, 'estándares.')
        .replace(/Multiply/gi, 'Multiplicar')
        .replace(/Divide/gi, 'Dividir')
        .replace(/Subtract/gi, 'Restar')
        .replace(/Add/gi, 'Sumar')
        .replace(/Calculate/gi, 'Calcular')
        .replace(/Determine/gi, 'Determinar');
    }),
    workedExample: detail.workedExample ? {
      ...detail.workedExample,
      title: `Evaluación Práctica de ${calcName}`,
      scenario: `Cálculo de ejemplo aplicando ${calcName} con valores de prueba típicos para verificar el resultado.`,
      inputs: Object.fromEntries(
        Object.entries(detail.workedExample.inputs || {}).map(([k, v]) => [translateTerm(k, 'es'), String(v)])
      ),
      steps: (detail.workedExample.steps || []).map((s: string) =>
        s.replace(/Load parameters into/gi, 'Cargar parámetros en la fórmula')
         .replace(/Execute computation/gi, 'Ejecutar el cómputo matemático')
         .replace(/Formula:/gi, 'Fórmula:')
      ),
      result: translateTerm(detail.workedExample.result, 'es'),
    } : detail.workedExample,
    assumptions: (detail.assumptions || []).map((a: string) =>
      a.replace(/Assumes standard valid numeric inputs for/gi, 'Asume entradas numéricas válidas y dentro del rango para')
       .replace(/Standard decimal arithmetic with IEEE 754 precision\./gi, 'Aritmética decimal estándar con precisión IEEE 754.')
       .replace(/Divisions by zero are flagged and blocked\./gi, 'Las divisiones por cero se identifican y se bloquean automáticamente.')
    ),
    limitations: (detail.limitations || []).map((l: string) =>
      l.replace(/Applicable within the standard domain of/gi, 'Aplicable dentro del dominio numérico estándar de')
       .replace(/Does not account for/gi, 'No toma en cuenta')
    ),
    disclaimerText: `Resumen informativo para ${calcName}. Ejecutado en tu navegador sin recopilación de datos privados; verifica de forma independiente resultados críticos.`,
    faqs: (detail.faqs || []).map((faq: any) => ({
      question: faq.question
        .replace(/What is the primary purpose of the (.*) calculator\?/gi, `¿Cuál es el propósito principal de la ${calcName}?`)
        .replace(/How do I enter parameters into the (.*)\?/gi, `¿Cómo se ingresan los parámetros en la ${calcName}?`)
        .replace(/What formula is utilized by the (.*)\?/gi, `¿Qué fórmula utiliza la ${calcName}?`)
        .replace(/How do I interpret the output produced by the (.*)\?/gi, `¿Cómo interpretar los resultados de la ${calcName}?`)
        .replace(/Are there specific input restrictions for the (.*)\?/gi, `¿Existen restricciones de entrada para la ${calcName}?`),
      answer: faq.answer
        .replace(/The (.*) calculator is designed to (.*) efficiently using the governing mathematical formula (.*)\./gi, `La ${calcName} está diseñada para calcular de forma eficiente utilizando la fórmula matemática correspondiente.`)
        .replace(/Enter your specific numerical values into the designated input fields for (.*)\. The system automatically validates numeric types and domain boundaries before computing\./gi, `Ingrese sus valores numéricos en los campos designados de la ${calcName}. El sistema valida los tipos y límites antes de computar.`)
        .replace(/The (.*) tool evaluates the mathematical expression (.*) to derive precise analytical results\./gi, `La herramienta evalúa la expresión matemática para obtener resultados analíticos precisos.`)
        .replace(/The computed output represents the exact solution for (.*) based on your provided inputs, formatted for immediate practical or technical use\./gi, `El resultado representa la solución exacta para la ${calcName} basada en los datos ingresados.`)
        .replace(/Yes, inputs for (.*) must adhere to valid mathematical domains (.*) as enforced by the validation engine\./gi, `Sí, los valores deben pertenecer a dominios matemáticos válidos (evitando divisiones por cero o raíces negativas no válidas).`),
    })),
  };
}
