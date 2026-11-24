import type { Language } from './translations.ts';

export interface ESignTranslations {
  // Tool Titles & Short Descriptions
  'esign.tool.signPdf': string;
  'esign.tool.createSignature': string;
  'esign.tool.fillAndSign': string;
  'esign.tool.addDateInitials': string;

  // Navigation & Section Headings
  'esign.panel.document': string;
  'esign.panel.signatureLibrary': string;
  'esign.panel.elementsToolbar': string;
  'esign.panel.output': string;
  'esign.panel.pages': string;

  // Upload & Document Actions
  'esign.upload.dropPrompt': string;
  'esign.upload.replacePrompt': string;
  'esign.upload.hint': string;
  'esign.upload.passwordPrompt': string;
  'esign.upload.passwordPlaceholder': string;
  'esign.upload.unlockButton': string;
  'esign.upload.imageDropPrompt': string;
  'esign.upload.imageHint': string;

  // Signature Creator Modes
  'esign.mode.draw': string;
  'esign.mode.type': string;
  'esign.mode.upload': string;
  'esign.draw.placeholder': string;
  'esign.type.nameLabel': string;
  'esign.type.namePlaceholder': string;
  'esign.type.initialsPlaceholder': string;
  'esign.type.fontLabel': string;
  'esign.type.colorLabel': string;
  'esign.upload.removeBg': string;
  'esign.preview.transparent': string;

  // Element Types & Toolbar
  'esign.element.signature': string;
  'esign.element.initials': string;
  'esign.element.date': string;
  'esign.element.text': string;
  'esign.element.checkmark': string;
  'esign.element.textPlaceholder': string;
  'esign.element.dateFormat': string;
  'esign.element.fontSize': string;

  // Actions
  'esign.action.addSignature': string;
  'esign.action.addInitials': string;
  'esign.action.addDate': string;
  'esign.action.addText': string;
  'esign.action.addCheckmark': string;
  'esign.action.createSignature': string;
  'esign.action.createInitials': string;
  'esign.action.saveToSession': string;
  'esign.action.useSignature': string;
  'esign.action.downloadPng': string;
  'esign.action.openSignPdf': string;
  'esign.action.clearPad': string;
  'esign.action.undo': string;
  'esign.action.redo': string;
  'esign.action.deleteElement': string;
  'esign.action.duplicateElement': string;
  'esign.action.applyAllPages': string;
  'esign.action.resetDocument': string;
  'esign.action.clearSession': string;
  'esign.action.exportPdf': string;
  'esign.action.exporting': string;
  'esign.action.downloadSignedPdf': string;
  'esign.action.prevPage': string;
  'esign.action.nextPage': string;
  'esign.action.zoomIn': string;
  'esign.action.zoomOut': string;
  'esign.action.close': string;

  // Status, Labels & Feedback
  'esign.status.ready': string;
  'esign.status.readyHint': string;
  'esign.status.pageOf': string;
  'esign.status.elementsCount': string;
  'esign.status.sessionReady': string;
  'esign.status.sessionEmpty': string;
  'esign.status.sessionCleared': string;
  'esign.status.savedToSession': string;
  'esign.status.exportSuccess': string;
  'esign.status.appliedAllPages': string;
  'esign.status.loadingPdf': string;
  'esign.status.renderingPage': string;

  // Privacy & Legal Scope Notices
  'esign.notice.localPrivacy': string;
  'esign.notice.visualScope': string;

  // Validation & Error Messages
  'esign.error.emptySignature': string;
  'esign.error.noPdfUploaded': string;
  'esign.error.noElementsPlaced': string;
  'esign.error.unsupportedImage': string;
  'esign.error.invalidPdf': string;
  'esign.error.passwordRequired': string;
  'esign.error.exportFailed': string;
}

const EN_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'Sign PDF',
  'esign.tool.createSignature': 'Create Signature',
  'esign.tool.fillAndSign': 'Fill & Sign PDF',
  'esign.tool.addDateInitials': 'Add Date & Initials',

  'esign.panel.document': 'PDF Document',
  'esign.panel.signatureLibrary': 'Session Signature',
  'esign.panel.elementsToolbar': 'Signing Tools',
  'esign.panel.output': 'Signed Document & Export',
  'esign.panel.pages': 'Pages',

  'esign.upload.dropPrompt': 'Click to upload or drag & drop a PDF file',
  'esign.upload.replacePrompt': 'Click or drop a PDF to replace document',
  'esign.upload.hint': '100% browser-local processing · Up to 250 MB',
  'esign.upload.passwordPrompt': 'This PDF is password-protected. Enter the password to view and sign it.',
  'esign.upload.passwordPlaceholder': 'Enter PDF password...',
  'esign.upload.unlockButton': 'Unlock PDF',
  'esign.upload.imageDropPrompt': 'Upload a PNG or JPEG signature image',
  'esign.upload.imageHint': 'Transparent PNG or clean JPEG · Max 10 MB',

  'esign.mode.draw': 'Draw',
  'esign.mode.type': 'Type',
  'esign.mode.upload': 'Upload',
  'esign.draw.placeholder': 'Draw your signature here using mouse or touch',
  'esign.type.nameLabel': 'Type your signature',
  'esign.type.namePlaceholder': 'Alex Morgan',
  'esign.type.initialsPlaceholder': 'AM',
  'esign.type.fontLabel': 'Signature Style',
  'esign.type.colorLabel': 'Ink Color',
  'esign.upload.removeBg': 'Remove white background',
  'esign.preview.transparent': 'Transparent PNG Preview',

  'esign.element.signature': 'Signature',
  'esign.element.initials': 'Initials',
  'esign.element.date': 'Date',
  'esign.element.text': 'Text',
  'esign.element.checkmark': 'Checkmark',
  'esign.element.textPlaceholder': 'Enter text...',
  'esign.element.dateFormat': 'Date Format',
  'esign.element.fontSize': 'Font Size',

  'esign.action.addSignature': 'Add Signature',
  'esign.action.addInitials': 'Add Initials',
  'esign.action.addDate': 'Add Date',
  'esign.action.addText': 'Add Text',
  'esign.action.addCheckmark': 'Add Checkmark',
  'esign.action.createSignature': 'Create Signature',
  'esign.action.createInitials': 'Create Initials',
  'esign.action.saveToSession': 'Save to Session',
  'esign.action.useSignature': 'Apply Signature',
  'esign.action.downloadPng': 'Download Transparent PNG',
  'esign.action.openSignPdf': 'Sign a PDF with This Signature',
  'esign.action.clearPad': 'Clear',
  'esign.action.undo': 'Undo',
  'esign.action.redo': 'Redo',
  'esign.action.deleteElement': 'Delete',
  'esign.action.duplicateElement': 'Duplicate',
  'esign.action.applyAllPages': 'Apply to All Pages',
  'esign.action.resetDocument': 'Reset',
  'esign.action.clearSession': 'Clear Session',
  'esign.action.exportPdf': 'Export Signed PDF',
  'esign.action.exporting': 'Generating signed PDF...',
  'esign.action.downloadSignedPdf': 'Download Signed PDF',
  'esign.action.prevPage': 'Previous Page',
  'esign.action.nextPage': 'Next Page',
  'esign.action.zoomIn': 'Zoom In',
  'esign.action.zoomOut': 'Zoom Out',
  'esign.action.close': 'Close',

  'esign.status.ready': 'Ready to Sign',
  'esign.status.readyHint': 'Upload a PDF, place your signature or fields on any page, and click Export Signed PDF.',
  'esign.status.pageOf': 'Page {current} of {total}',
  'esign.status.elementsCount': '{count} item(s) placed',
  'esign.status.sessionReady': 'Saved in current browser session',
  'esign.status.sessionEmpty': 'No signature saved in session yet',
  'esign.status.sessionCleared': 'Session signatures cleared from memory.',
  'esign.status.savedToSession': 'Signature saved for this browser session.',
  'esign.status.exportSuccess': 'Signed PDF generated and verified.',
  'esign.status.appliedAllPages': 'Applied selected item to all pages.',
  'esign.status.loadingPdf': 'Loading PDF pages locally...',
  'esign.status.renderingPage': 'Rendering page...',

  'esign.notice.localPrivacy': 'Files and signatures stay in your browser memory and are never uploaded.',
  'esign.notice.visualScope': 'Visual electronic signature only — does not apply a cryptographic PKI/X.509 digital certificate.',

  'esign.error.emptySignature': 'Please draw, type, or upload a signature first.',
  'esign.error.noPdfUploaded': 'Please upload a PDF document before exporting.',
  'esign.error.noElementsPlaced': 'Place at least one signature, initial, date, text, or checkmark before exporting.',
  'esign.error.unsupportedImage': 'Invalid or unsupported image. Please upload a valid PNG or JPEG file.',
  'esign.error.invalidPdf': 'The selected file is not a valid or readable PDF document.',
  'esign.error.passwordRequired': 'A valid PDF password is required to open this encrypted document.',
  'esign.error.exportFailed': 'Could not export the signed PDF document.'
};

const ES_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'Firmar PDF',
  'esign.tool.createSignature': 'Crear Firma',
  'esign.tool.fillAndSign': 'Rellenar y Firmar PDF',
  'esign.tool.addDateInitials': 'Añadir Fecha e Iniciales',

  'esign.panel.document': 'Documento PDF',
  'esign.panel.signatureLibrary': 'Firma de la Sesión',
  'esign.panel.elementsToolbar': 'Herramientas de Firma',
  'esign.panel.output': 'Documento Firmado y Exportación',
  'esign.panel.pages': 'Páginas',

  'esign.upload.dropPrompt': 'Haz clic o arrastra un archivo PDF aquí',
  'esign.upload.replacePrompt': 'Haz clic o arrastra un PDF para reemplazar el documento',
  'esign.upload.hint': 'Procesamiento 100% local en tu navegador · Hasta 250 MB',
  'esign.upload.passwordPrompt': 'Este PDF está protegido con contraseña. Ingresa la contraseña para verlo y firmarlo.',
  'esign.upload.passwordPlaceholder': 'Ingresa la contraseña del PDF...',
  'esign.upload.unlockButton': 'Desbloquear PDF',
  'esign.upload.imageDropPrompt': 'Sube una imagen de firma PNG o JPEG',
  'esign.upload.imageHint': 'PNG transparente o JPEG limpio · Máx. 10 MB',

  'esign.mode.draw': 'Dibujar',
  'esign.mode.type': 'Escribir',
  'esign.mode.upload': 'Subir',
  'esign.draw.placeholder': 'Dibuja tu firma aquí con el ratón o con el dedo',
  'esign.type.nameLabel': 'Escribe tu firma',
  'esign.type.namePlaceholder': 'Alejandro Morales',
  'esign.type.initialsPlaceholder': 'AM',
  'esign.type.fontLabel': 'Estilo de Firma',
  'esign.type.colorLabel': 'Color de Tinta',
  'esign.upload.removeBg': 'Eliminar fondo blanco',
  'esign.preview.transparent': 'Vista Previa PNG Transparente',

  'esign.element.signature': 'Firma',
  'esign.element.initials': 'Iniciales',
  'esign.element.date': 'Fecha',
  'esign.element.text': 'Texto',
  'esign.element.checkmark': 'Marca de verificación',
  'esign.element.textPlaceholder': 'Escribe un texto...',
  'esign.element.dateFormat': 'Formato de Fecha',
  'esign.element.fontSize': 'Tamaño de Fuente',

  'esign.action.addSignature': 'Añadir Firma',
  'esign.action.addInitials': 'Añadir Iniciales',
  'esign.action.addDate': 'Añadir Fecha',
  'esign.action.addText': 'Añadir Texto',
  'esign.action.addCheckmark': 'Añadir Marca',
  'esign.action.createSignature': 'Crear Firma',
  'esign.action.createInitials': 'Crear Iniciales',
  'esign.action.saveToSession': 'Guardar en la Sesión',
  'esign.action.useSignature': 'Aplicar Firma',
  'esign.action.downloadPng': 'Descargar PNG Transparente',
  'esign.action.openSignPdf': 'Firmar un PDF con Esta Firma',
  'esign.action.clearPad': 'Limpiar',
  'esign.action.undo': 'Deshacer',
  'esign.action.redo': 'Rehacer',
  'esign.action.deleteElement': 'Eliminar',
  'esign.action.duplicateElement': 'Duplicar',
  'esign.action.applyAllPages': 'Aplicar a Todas las Páginas',
  'esign.action.resetDocument': 'Restablecer',
  'esign.action.clearSession': 'Borrar Sesión',
  'esign.action.exportPdf': 'Exportar PDF Firmado',
  'esign.action.exporting': 'Generando PDF firmado...',
  'esign.action.downloadSignedPdf': 'Descargar PDF Firmado',
  'esign.action.prevPage': 'Página Anterior',
  'esign.action.nextPage': 'Página Siguiente',
  'esign.action.zoomIn': 'Acercar',
  'esign.action.zoomOut': 'Alejar',
  'esign.action.close': 'Cerrar',

  'esign.status.ready': 'Listo para Firmar',
  'esign.status.readyHint': 'Sube un PDF, coloca tu firma o campos en cualquier página y haz clic en Exportar PDF Firmado.',
  'esign.status.pageOf': 'Página {current} de {total}',
  'esign.status.elementsCount': '{count} elemento(s) colocado(s)',
  'esign.status.sessionReady': 'Guardada en la sesión actual del navegador',
  'esign.status.sessionEmpty': 'Aún no hay firma guardada en esta sesión',
  'esign.status.sessionCleared': 'Firmas de la sesión eliminadas de la memoria.',
  'esign.status.savedToSession': 'Firma guardada para esta sesión del navegador.',
  'esign.status.exportSuccess': 'PDF firmado generado y verificado.',
  'esign.status.appliedAllPages': 'Elemento aplicado a todas las páginas.',
  'esign.status.loadingPdf': 'Cargando páginas del PDF localmente...',
  'esign.status.renderingPage': 'Renderizando página...',

  'esign.notice.localPrivacy': 'Tus archivos y firmas permanecen en la memoria de tu navegador y nunca se suben.',
  'esign.notice.visualScope': 'Solo firma electrónica visual: no aplica un certificado digital criptográfico PKI/X.509.',

  'esign.error.emptySignature': 'Primero dibuja, escribe o sube una firma.',
  'esign.error.noPdfUploaded': 'Sube un documento PDF antes de exportar.',
  'esign.error.noElementsPlaced': 'Coloca al menos una firma, inicial, fecha, texto o marca antes de exportar.',
  'esign.error.unsupportedImage': 'Imagen inválida o no compatible. Sube un archivo PNG o JPEG válido.',
  'esign.error.invalidPdf': 'El archivo seleccionado no es un documento PDF válido o legible.',
  'esign.error.passwordRequired': 'Se requiere una contraseña válida para abrir este PDF cifrado.',
  'esign.error.exportFailed': 'No se pudo exportar el documento PDF firmado.'
};

const FR_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'Signer un PDF',
  'esign.tool.createSignature': 'Créer une Signature',
  'esign.tool.fillAndSign': 'Remplir et Signer un PDF',
  'esign.tool.addDateInitials': 'Ajouter Date et Initiales',

  'esign.panel.document': 'Document PDF',
  'esign.panel.signatureLibrary': 'Signature de Session',
  'esign.panel.elementsToolbar': 'Outils de Signature',
  'esign.panel.output': 'Document Signé et Export',
  'esign.panel.pages': 'Pages',

  'esign.upload.dropPrompt': 'Cliquez ou déposez un fichier PDF ici',
  'esign.upload.replacePrompt': 'Cliquez ou déposez un PDF pour remplacer le document',
  'esign.upload.hint': 'Traitement 100 % local dans le navigateur · Jusqu’à 250 Mo',
  'esign.upload.passwordPrompt': 'Ce PDF est protégé par mot de passe. Saisissez le mot de passe pour l’afficher et le signer.',
  'esign.upload.passwordPlaceholder': 'Mot de passe du PDF...',
  'esign.upload.unlockButton': 'Déverrouiller le PDF',
  'esign.upload.imageDropPrompt': 'Importez une image de signature PNG ou JPEG',
  'esign.upload.imageHint': 'PNG transparent ou JPEG net · 10 Mo max.',

  'esign.mode.draw': 'Dessiner',
  'esign.mode.type': 'Saisir',
  'esign.mode.upload': 'Importer',
  'esign.draw.placeholder': 'Dessinez votre signature à la souris ou au tactile',
  'esign.type.nameLabel': 'Saisissez votre signature',
  'esign.type.namePlaceholder': 'Camille Laurent',
  'esign.type.initialsPlaceholder': 'CL',
  'esign.type.fontLabel': 'Style de Signature',
  'esign.type.colorLabel': 'Couleur d’Encre',
  'esign.upload.removeBg': 'Supprimer l’arrière-plan blanc',
  'esign.preview.transparent': 'Aperçu PNG Transparent',

  'esign.element.signature': 'Signature',
  'esign.element.initials': 'Initiales',
  'esign.element.date': 'Date',
  'esign.element.text': 'Texte',
  'esign.element.checkmark': 'Coche',
  'esign.element.textPlaceholder': 'Saisir un texte...',
  'esign.element.dateFormat': 'Format de Date',
  'esign.element.fontSize': 'Taille de Police',

  'esign.action.addSignature': 'Ajouter Signature',
  'esign.action.addInitials': 'Ajouter Initiales',
  'esign.action.addDate': 'Ajouter Date',
  'esign.action.addText': 'Ajouter Texte',
  'esign.action.addCheckmark': 'Ajouter Coche',
  'esign.action.createSignature': 'Créer une Signature',
  'esign.action.createInitials': 'Créer des Initiales',
  'esign.action.saveToSession': 'Enregistrer pour la Session',
  'esign.action.useSignature': 'Appliquer la Signature',
  'esign.action.downloadPng': 'Télécharger PNG Transparent',
  'esign.action.openSignPdf': 'Signer un PDF avec Cette Signature',
  'esign.action.clearPad': 'Effacer',
  'esign.action.undo': 'Annuler',
  'esign.action.redo': 'Rétablir',
  'esign.action.deleteElement': 'Supprimer',
  'esign.action.duplicateElement': 'Dupliquer',
  'esign.action.applyAllPages': 'Appliquer à Toutes les Pages',
  'esign.action.resetDocument': 'Réinitialiser',
  'esign.action.clearSession': 'Effacer la Session',
  'esign.action.exportPdf': 'Exporter le PDF Signé',
  'esign.action.exporting': 'Génération du PDF signé...',
  'esign.action.downloadSignedPdf': 'Télécharger le PDF Signé',
  'esign.action.prevPage': 'Page Précédente',
  'esign.action.nextPage': 'Page Suivante',
  'esign.action.zoomIn': 'Zoom Avant',
  'esign.action.zoomOut': 'Zoom Arrière',
  'esign.action.close': 'Fermer',

  'esign.status.ready': 'Prêt à Signer',
  'esign.status.readyHint': 'Importez un PDF, placez votre signature ou vos champs, puis cliquez sur Exporter le PDF Signé.',
  'esign.status.pageOf': 'Page {current} sur {total}',
  'esign.status.elementsCount': '{count} élément(s) placé(s)',
  'esign.status.sessionReady': 'Enregistrée pour la session en cours',
  'esign.status.sessionEmpty': 'Aucune signature enregistrée dans cette session',
  'esign.status.sessionCleared': 'Signatures de session effacées de la mémoire.',
  'esign.status.savedToSession': 'Signature enregistrée pour cette session.',
  'esign.status.exportSuccess': 'PDF signé généré et vérifié.',
  'esign.status.appliedAllPages': 'Élément appliqué à toutes les pages.',
  'esign.status.loadingPdf': 'Chargement local des pages PDF...',
  'esign.status.renderingPage': 'Rendu de la page...',

  'esign.notice.localPrivacy': 'Vos fichiers et signatures restent dans la mémoire du navigateur sans aucun envoi.',
  'esign.notice.visualScope': 'Signature électronique visuelle uniquement — sans certificat cryptographique PKI/X.509.',

  'esign.error.emptySignature': 'Veuillez d’abord dessiner, saisir ou importer une signature.',
  'esign.error.noPdfUploaded': 'Veuillez importer un document PDF avant d’exporter.',
  'esign.error.noElementsPlaced': 'Placez au moins une signature, initiale, date, texte ou coche avant d’exporter.',
  'esign.error.unsupportedImage': 'Image invalide ou non prise en charge. Veuillez importer un fichier PNG ou JPEG valide.',
  'esign.error.invalidPdf': 'Le fichier sélectionné n’est pas un document PDF valide ou lisible.',
  'esign.error.passwordRequired': 'Un mot de passe PDF valide est requis pour ouvrir ce document chiffré.',
  'esign.error.exportFailed': 'Impossible d’exporter le document PDF signé.'
};

const PT_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'Assinar PDF',
  'esign.tool.createSignature': 'Criar Assinatura',
  'esign.tool.fillAndSign': 'Preencher e Assinar PDF',
  'esign.tool.addDateInitials': 'Adicionar Data e Iniciais',

  'esign.panel.document': 'Documento PDF',
  'esign.panel.signatureLibrary': 'Assinatura da Sessão',
  'esign.panel.elementsToolbar': 'Ferramentas de Assinatura',
  'esign.panel.output': 'Documento Assinado e Exportação',
  'esign.panel.pages': 'Páginas',

  'esign.upload.dropPrompt': 'Clique ou arraste um arquivo PDF aqui',
  'esign.upload.replacePrompt': 'Clique ou arraste um PDF para substituir o documento',
  'esign.upload.hint': 'Processamento 100% local no navegador · Até 250 MB',
  'esign.upload.passwordPrompt': 'Este PDF é protegido por senha. Digite a senha para visualizar e assinar.',
  'esign.upload.passwordPlaceholder': 'Digite a senha do PDF...',
  'esign.upload.unlockButton': 'Desbloquear PDF',
  'esign.upload.imageDropPrompt': 'Envie uma imagem de assinatura PNG ou JPEG',
  'esign.upload.imageHint': 'PNG transparente ou JPEG limpo · Máx. 10 MB',

  'esign.mode.draw': 'Desenhar',
  'esign.mode.type': 'Digitar',
  'esign.mode.upload': 'Enviar',
  'esign.draw.placeholder': 'Desenhe sua assinatura aqui usando mouse ou toque',
  'esign.type.nameLabel': 'Digite sua assinatura',
  'esign.type.namePlaceholder': 'Lucas Almeida',
  'esign.type.initialsPlaceholder': 'LA',
  'esign.type.fontLabel': 'Estilo da Assinatura',
  'esign.type.colorLabel': 'Cor da Tinta',
  'esign.upload.removeBg': 'Remover fundo branco',
  'esign.preview.transparent': 'Prévia PNG Transparente',

  'esign.element.signature': 'Assinatura',
  'esign.element.initials': 'Iniciais',
  'esign.element.date': 'Data',
  'esign.element.text': 'Texto',
  'esign.element.checkmark': 'Marca de seleção',
  'esign.element.textPlaceholder': 'Digite o texto...',
  'esign.element.dateFormat': 'Formato da Data',
  'esign.element.fontSize': 'Tamanho da Fonte',

  'esign.action.addSignature': 'Adicionar Assinatura',
  'esign.action.addInitials': 'Adicionar Iniciais',
  'esign.action.addDate': 'Adicionar Data',
  'esign.action.addText': 'Adicionar Texto',
  'esign.action.addCheckmark': 'Adicionar Marca',
  'esign.action.createSignature': 'Criar Assinatura',
  'esign.action.createInitials': 'Criar Iniciais',
  'esign.action.saveToSession': 'Salvar na Sessão',
  'esign.action.useSignature': 'Aplicar Assinatura',
  'esign.action.downloadPng': 'Baixar PNG Transparente',
  'esign.action.openSignPdf': 'Assinar um PDF com Esta Assinatura',
  'esign.action.clearPad': 'Limpar',
  'esign.action.undo': 'Desfazer',
  'esign.action.redo': 'Refazer',
  'esign.action.deleteElement': 'Excluir',
  'esign.action.duplicateElement': 'Duplicar',
  'esign.action.applyAllPages': 'Aplicar a Todas as Páginas',
  'esign.action.resetDocument': 'Redefinir',
  'esign.action.clearSession': 'Limpar Sessão',
  'esign.action.exportPdf': 'Exportar PDF Assinado',
  'esign.action.exporting': 'Gerando PDF assinado...',
  'esign.action.downloadSignedPdf': 'Baixar PDF Assinado',
  'esign.action.prevPage': 'Página Anterior',
  'esign.action.nextPage': 'Próxima Página',
  'esign.action.zoomIn': 'Aumentar Zoom',
  'esign.action.zoomOut': 'Diminuir Zoom',
  'esign.action.close': 'Fechar',

  'esign.status.ready': 'Pronto para Assinar',
  'esign.status.readyHint': 'Envie um PDF, posicione sua assinatura ou campos em qualquer página e clique em Exportar PDF Assinado.',
  'esign.status.pageOf': 'Página {current} de {total}',
  'esign.status.elementsCount': '{count} item(ns) inserido(s)',
  'esign.status.sessionReady': 'Salva na sessão atual do navegador',
  'esign.status.sessionEmpty': 'Nenhuma assinatura salva nesta sessão',
  'esign.status.sessionCleared': 'Assinaturas da sessão removidas da memória.',
  'esign.status.savedToSession': 'Assinatura salva para esta sessão do navegador.',
  'esign.status.exportSuccess': 'PDF assinado gerado e verificado.',
  'esign.status.appliedAllPages': 'Item aplicado a todas as páginas.',
  'esign.status.loadingPdf': 'Carregando páginas do PDF localmente...',
  'esign.status.renderingPage': 'Renderizando página...',

  'esign.notice.localPrivacy': 'Arquivos e assinaturas permanecem na memória do navegador e nunca são enviados.',
  'esign.notice.visualScope': 'Apenas assinatura eletrônica visual — não aplica certificado digital criptográfico PKI/X.509.',

  'esign.error.emptySignature': 'Desenhe, digite ou envie uma assinatura primeiro.',
  'esign.error.noPdfUploaded': 'Envie um documento PDF antes de exportar.',
  'esign.error.noElementsPlaced': 'Insira ao menos uma assinatura, inicial, data, texto ou marca antes de exportar.',
  'esign.error.unsupportedImage': 'Imagem inválida ou não suportada. Envie um arquivo PNG ou JPEG válido.',
  'esign.error.invalidPdf': 'O arquivo selecionado não é um documento PDF válido ou legível.',
  'esign.error.passwordRequired': 'É necessária uma senha válida para abrir este PDF criptografado.',
  'esign.error.exportFailed': 'Não foi possível exportar o documento PDF assinado.'
};

const DE_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'PDF unterschreiben',
  'esign.tool.createSignature': 'Unterschrift erstellen',
  'esign.tool.fillAndSign': 'PDF ausfüllen & unterschreiben',
  'esign.tool.addDateInitials': 'Datum & Initialen hinzufügen',

  'esign.panel.document': 'PDF-Dokument',
  'esign.panel.signatureLibrary': 'Sitzungs-Unterschrift',
  'esign.panel.elementsToolbar': 'Signierwerkzeuge',
  'esign.panel.output': 'Signiertes Dokument & Export',
  'esign.panel.pages': 'Seiten',

  'esign.upload.dropPrompt': 'Klicken oder PDF-Datei hierher ziehen',
  'esign.upload.replacePrompt': 'Klicken oder PDF ablegen, um Dokument zu ersetzen',
  'esign.upload.hint': '100 % lokal im Browser · Bis zu 250 MB',
  'esign.upload.passwordPrompt': 'Dieses PDF ist passwortgeschützt. Passwort eingeben zum Anzeigen und Unterschreiben.',
  'esign.upload.passwordPlaceholder': 'PDF-Passwort eingeben...',
  'esign.upload.unlockButton': 'PDF entsperren',
  'esign.upload.imageDropPrompt': 'PNG- oder JPEG-Unterschrift hochladen',
  'esign.upload.imageHint': 'Transparentes PNG oder sauberes JPEG · Max. 10 MB',

  'esign.mode.draw': 'Zeichnen',
  'esign.mode.type': 'Tippen',
  'esign.mode.upload': 'Hochladen',
  'esign.draw.placeholder': 'Unterschrift hier mit Maus oder Touch zeichnen',
  'esign.type.nameLabel': 'Unterschrift eingeben',
  'esign.type.namePlaceholder': 'Lukas Weber',
  'esign.type.initialsPlaceholder': 'LW',
  'esign.type.fontLabel': 'Schriftstil',
  'esign.type.colorLabel': 'Tintenfarbe',
  'esign.upload.removeBg': 'Weißen Hintergrund entfernen',
  'esign.preview.transparent': 'Transparente PNG-Vorschau',

  'esign.element.signature': 'Unterschrift',
  'esign.element.initials': 'Initialen',
  'esign.element.date': 'Datum',
  'esign.element.text': 'Text',
  'esign.element.checkmark': 'Häkchen',
  'esign.element.textPlaceholder': 'Text eingeben...',
  'esign.element.dateFormat': 'Datumsformat',
  'esign.element.fontSize': 'Schriftgröße',

  'esign.action.addSignature': 'Unterschrift einfügen',
  'esign.action.addInitials': 'Initialen einfügen',
  'esign.action.addDate': 'Datum einfügen',
  'esign.action.addText': 'Text einfügen',
  'esign.action.addCheckmark': 'Häkchen einfügen',
  'esign.action.createSignature': 'Unterschrift erstellen',
  'esign.action.createInitials': 'Initialen erstellen',
  'esign.action.saveToSession': 'Für Sitzung speichern',
  'esign.action.useSignature': 'Unterschrift anwenden',
  'esign.action.downloadPng': 'Transparentes PNG herunterladen',
  'esign.action.openSignPdf': 'PDF mit dieser Unterschrift signieren',
  'esign.action.clearPad': 'Leeren',
  'esign.action.undo': 'Rückgängig',
  'esign.action.redo': 'Wiederholen',
  'esign.action.deleteElement': 'Löschen',
  'esign.action.duplicateElement': 'Duplizieren',
  'esign.action.applyAllPages': 'Auf alle Seiten anwenden',
  'esign.action.resetDocument': 'Zurücksetzen',
  'esign.action.clearSession': 'Sitzung leeren',
  'esign.action.exportPdf': 'Signiertes PDF exportieren',
  'esign.action.exporting': 'Signiertes PDF wird erstellt...',
  'esign.action.downloadSignedPdf': 'Signiertes PDF herunterladen',
  'esign.action.prevPage': 'Vorherige Seite',
  'esign.action.nextPage': 'Nächste Seite',
  'esign.action.zoomIn': 'Vergrößern',
  'esign.action.zoomOut': 'Verkleinern',
  'esign.action.close': 'Schließen',

  'esign.status.ready': 'Bereit zum Unterschreiben',
  'esign.status.readyHint': 'PDF hochladen, Unterschrift oder Felder platzieren und auf Signiertes PDF exportieren klicken.',
  'esign.status.pageOf': 'Seite {current} von {total}',
  'esign.status.elementsCount': '{count} Element(e) platziert',
  'esign.status.sessionReady': 'In der aktuellen Browser-Sitzung gespeichert',
  'esign.status.sessionEmpty': 'Noch keine Unterschrift in dieser Sitzung gespeichert',
  'esign.status.sessionCleared': 'Sitzungs-Unterschriften aus dem Speicher gelöscht.',
  'esign.status.savedToSession': 'Unterschrift für diese Browser-Sitzung gespeichert.',
  'esign.status.exportSuccess': 'Signiertes PDF erstellt und geprüft.',
  'esign.status.appliedAllPages': 'Ausgewähltes Element auf alle Seiten angewendet.',
  'esign.status.loadingPdf': 'PDF-Seiten werden lokal geladen...',
  'esign.status.renderingPage': 'Seite wird gerendert...',

  'esign.notice.localPrivacy': 'Dateien und Unterschriften bleiben im Browserspeicher und werden nie hochgeladen.',
  'esign.notice.visualScope': 'Nur visuelle elektronische Signatur — kein kryptografisches PKI/X.509-Zertifikat.',

  'esign.error.emptySignature': 'Bitte zeichnen, tippen oder laden Sie zuerst eine Unterschrift hoch.',
  'esign.error.noPdfUploaded': 'Bitte laden Sie vor dem Export ein PDF-Dokument hoch.',
  'esign.error.noElementsPlaced': 'Platzieren Sie mindestens eine Unterschrift, Initialen, Datum, Text oder Häkchen.',
  'esign.error.unsupportedImage': 'Ungültiges oder nicht unterstütztes Bild. Bitte eine gültige PNG- oder JPEG-Datei hochladen.',
  'esign.error.invalidPdf': 'Die ausgewählte Datei ist kein gültiges oder lesbares PDF-Dokument.',
  'esign.error.passwordRequired': 'Zum Öffnen dieses verschlüsselten PDFs ist ein gültiges Passwort erforderlich.',
  'esign.error.exportFailed': 'Das signierte PDF-Dokument konnte nicht exportiert werden.'
};

const IT_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'Firma PDF',
  'esign.tool.createSignature': 'Crea Firma',
  'esign.tool.fillAndSign': 'Compila e Firma PDF',
  'esign.tool.addDateInitials': 'Aggiungi Data e Iniziali',

  'esign.panel.document': 'Documento PDF',
  'esign.panel.signatureLibrary': 'Firma di Sessione',
  'esign.panel.elementsToolbar': 'Strumenti di Firma',
  'esign.panel.output': 'Documento Firmato ed Esportazione',
  'esign.panel.pages': 'Pagine',

  'esign.upload.dropPrompt': 'Clicca o trascina un file PDF qui',
  'esign.upload.replacePrompt': 'Clicca o trascina un PDF per sostituire il documento',
  'esign.upload.hint': 'Elaborazione 100% locale nel browser · Fino a 250 MB',
  'esign.upload.passwordPrompt': 'Questo PDF è protetto da password. Inserisci la password per visualizzarlo e firmarlo.',
  'esign.upload.passwordPlaceholder': 'Inserisci password PDF...',
  'esign.upload.unlockButton': 'Sblocca PDF',
  'esign.upload.imageDropPrompt': 'Carica un’immagine firma PNG o JPEG',
  'esign.upload.imageHint': 'PNG trasparente o JPEG nitido · Max 10 MB',

  'esign.mode.draw': 'Disegna',
  'esign.mode.type': 'Digita',
  'esign.mode.upload': 'Carica',
  'esign.draw.placeholder': 'Disegna qui la tua firma con mouse o tocco',
  'esign.type.nameLabel': 'Digita la tua firma',
  'esign.type.namePlaceholder': 'Giulia Rossi',
  'esign.type.initialsPlaceholder': 'GR',
  'esign.type.fontLabel': 'Stile Firma',
  'esign.type.colorLabel': 'Colore Inchiostro',
  'esign.upload.removeBg': 'Rimuovi sfondo bianco',
  'esign.preview.transparent': 'Anteprima PNG Trasparente',

  'esign.element.signature': 'Firma',
  'esign.element.initials': 'Iniziali',
  'esign.element.date': 'Data',
  'esign.element.text': 'Testo',
  'esign.element.checkmark': 'Spunta',
  'esign.element.textPlaceholder': 'Inserisci testo...',
  'esign.element.dateFormat': 'Formato Data',
  'esign.element.fontSize': 'Dimensione Testo',

  'esign.action.addSignature': 'Aggiungi Firma',
  'esign.action.addInitials': 'Aggiungi Iniziali',
  'esign.action.addDate': 'Aggiungi Data',
  'esign.action.addText': 'Aggiungi Testo',
  'esign.action.addCheckmark': 'Aggiungi Spunta',
  'esign.action.createSignature': 'Crea Firma',
  'esign.action.createInitials': 'Crea Iniziali',
  'esign.action.saveToSession': 'Salva nella Sessione',
  'esign.action.useSignature': 'Applica Firma',
  'esign.action.downloadPng': 'Scarica PNG Trasparente',
  'esign.action.openSignPdf': 'Firma un PDF con Questa Firma',
  'esign.action.clearPad': 'Cancella',
  'esign.action.undo': 'Annulla',
  'esign.action.redo': 'Ripeti',
  'esign.action.deleteElement': 'Elimina',
  'esign.action.duplicateElement': 'Duplica',
  'esign.action.applyAllPages': 'Applica a Tutte le Pagine',
  'esign.action.resetDocument': 'Ripristina',
  'esign.action.clearSession': 'Cancella Sessione',
  'esign.action.exportPdf': 'Esporta PDF Firmato',
  'esign.action.exporting': 'Generazione PDF firmato...',
  'esign.action.downloadSignedPdf': 'Scarica PDF Firmato',
  'esign.action.prevPage': 'Pagina Precedente',
  'esign.action.nextPage': 'Pagina Successiva',
  'esign.action.zoomIn': 'Ingrandisci',
  'esign.action.zoomOut': 'Riduci',
  'esign.action.close': 'Chiudi',

  'esign.status.ready': 'Pronto per la Firma',
  'esign.status.readyHint': 'Carica un PDF, posiziona la firma o i campi su qualsiasi pagina e clicca Esporta PDF Firmato.',
  'esign.status.pageOf': 'Pagina {current} di {total}',
  'esign.status.elementsCount': '{count} elemento/i posizionato/i',
  'esign.status.sessionReady': 'Salvata nella sessione corrente del browser',
  'esign.status.sessionEmpty': 'Nessuna firma salvata in questa sessione',
  'esign.status.sessionCleared': 'Firme di sessione rimosse dalla memoria.',
  'esign.status.savedToSession': 'Firma salvata per questa sessione del browser.',
  'esign.status.exportSuccess': 'PDF firmato generato e verificato.',
  'esign.status.appliedAllPages': 'Elemento applicato a tutte le pagine.',
  'esign.status.loadingPdf': 'Caricamento locale delle pagine PDF...',
  'esign.status.renderingPage': 'Rendering pagina...',

  'esign.notice.localPrivacy': 'File e firme restano nella memoria del browser e non vengono mai caricati online.',
  'esign.notice.visualScope': 'Solo firma elettronica visiva — non applica un certificato digitale crittografico PKI/X.509.',

  'esign.error.emptySignature': 'Disegna, digita o carica prima una firma.',
  'esign.error.noPdfUploaded': 'Carica un documento PDF prima di esportare.',
  'esign.error.noElementsPlaced': 'Posiziona almeno una firma, iniziale, data, testo o spunta prima di esportare.',
  'esign.error.unsupportedImage': 'Immagine non valida o non supportata. Carica un file PNG o JPEG valido.',
  'esign.error.invalidPdf': 'Il file selezionato non è un documento PDF valido o leggibile.',
  'esign.error.passwordRequired': 'È richiesta una password PDF valida per aprire questo documento crittografato.',
  'esign.error.exportFailed': 'Impossibile esportare il documento PDF firmato.'
};

const JA_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'PDFに署名',
  'esign.tool.createSignature': '署名を作成',
  'esign.tool.fillAndSign': 'PDF入力＆署名',
  'esign.tool.addDateInitials': '日付とイニシャルを追加',

  'esign.panel.document': 'PDFドキュメント',
  'esign.panel.signatureLibrary': 'セッション署名',
  'esign.panel.elementsToolbar': '署名ツール',
  'esign.panel.output': '署名済みPDFの出力',
  'esign.panel.pages': 'ページ',

  'esign.upload.dropPrompt': 'クリックまたはPDFファイルをここにドロップ',
  'esign.upload.replacePrompt': 'クリックまたはPDFをドロップして差し替え',
  'esign.upload.hint': 'ブラウザ内で100%ローカル処理・最大250 MB',
  'esign.upload.passwordPrompt': 'このPDFはパスワード保護されています。表示・署名するためパスワードを入力してください。',
  'esign.upload.passwordPlaceholder': 'PDFパスワードを入力...',
  'esign.upload.unlockButton': 'ロック解除',
  'esign.upload.imageDropPrompt': 'PNGまたはJPEG署名画像をアップロード',
  'esign.upload.imageHint': '透過PNGまたはJPEG・最大10 MB',

  'esign.mode.draw': '手書き',
  'esign.mode.type': '入力',
  'esign.mode.upload': '画像',
  'esign.draw.placeholder': 'マウスまたはタッチでここに署名を描画してください',
  'esign.type.nameLabel': '署名テキストを入力',
  'esign.type.namePlaceholder': '山田 太郎',
  'esign.type.initialsPlaceholder': 'TY',
  'esign.type.fontLabel': '署名スタイル',
  'esign.type.colorLabel': 'インク色',
  'esign.upload.removeBg': '白い背景を透過',
  'esign.preview.transparent': '透過PNGプレビュー',

  'esign.element.signature': '署名',
  'esign.element.initials': 'イニシャル',
  'esign.element.date': '日付',
  'esign.element.text': 'テキスト',
  'esign.element.checkmark': 'チェックマーク',
  'esign.element.textPlaceholder': 'テキストを入力...',
  'esign.element.dateFormat': '日付形式',
  'esign.element.fontSize': '文字サイズ',

  'esign.action.addSignature': '署名を追加',
  'esign.action.addInitials': 'イニシャルを追加',
  'esign.action.addDate': '日付を追加',
  'esign.action.addText': 'テキストを追加',
  'esign.action.addCheckmark': 'チェックを追加',
  'esign.action.createSignature': '署名を作成',
  'esign.action.createInitials': 'イニシャルを作成',
  'esign.action.saveToSession': 'セッションに保存',
  'esign.action.useSignature': '署名を適用',
  'esign.action.downloadPng': '透過PNGをダウンロード',
  'esign.action.openSignPdf': 'この署名でPDFに署名',
  'esign.action.clearPad': 'クリア',
  'esign.action.undo': '元に戻す',
  'esign.action.redo': 'やり直す',
  'esign.action.deleteElement': '削除',
  'esign.action.duplicateElement': '複製',
  'esign.action.applyAllPages': '全ページに適用',
  'esign.action.resetDocument': 'リセット',
  'esign.action.clearSession': 'セッション消去',
  'esign.action.exportPdf': '署名済みPDFを書き出し',
  'esign.action.exporting': '署名済みPDFを作成中...',
  'esign.action.downloadSignedPdf': '署名済みPDFをダウンロード',
  'esign.action.prevPage': '前のページ',
  'esign.action.nextPage': '次のページ',
  'esign.action.zoomIn': '拡大',
  'esign.action.zoomOut': '縮小',
  'esign.action.close': '閉じる',

  'esign.status.ready': '署名の準備完了',
  'esign.status.readyHint': 'PDFをアップロードし、署名や項目を配置して書き出してください。',
  'esign.status.pageOf': '{current} / {total} ページ',
  'esign.status.elementsCount': '{count} 個の項目を配置済み',
  'esign.status.sessionReady': '現在のブラウザセッションに保存済み',
  'esign.status.sessionEmpty': 'このセッションに保存された署名はありません',
  'esign.status.sessionCleared': 'セッション署名をメモリから消去しました。',
  'esign.status.savedToSession': 'このブラウザセッションに署名を保存しました。',
  'esign.status.exportSuccess': '署名済みPDFを生成・検証しました。',
  'esign.status.appliedAllPages': '選択した項目を全ページに適用しました。',
  'esign.status.loadingPdf': 'PDFページをローカルで読み込み中...',
  'esign.status.renderingPage': 'ページを描画中...',

  'esign.notice.localPrivacy': 'ファイルと署名はブラウザのメモリ内のみで処理され、外部へ送信されません。',
  'esign.notice.visualScope': '視覚的な電子署名のみ対応（暗号化PKI/X.509電子証明書は付与されません）。',

  'esign.error.emptySignature': '先に署名を描画、入力、またはアップロードしてください。',
  'esign.error.noPdfUploaded': '書き出す前にPDFドキュメントをアップロードしてください。',
  'esign.error.noElementsPlaced': '書き出す前に署名・イニシャル・日付・テキスト・チェックを1つ以上配置してください。',
  'esign.error.unsupportedImage': '無効または未対応の画像です。有効なPNGまたはJPEGファイルを選択してください。',
  'esign.error.invalidPdf': '選択したファイルは有効または読み取り可能なPDFではありません。',
  'esign.error.passwordRequired': 'この暗号化PDFを開くには正しいパスワードが必要です。',
  'esign.error.exportFailed': '署名済みPDFを書き出せませんでした。'
};

const ZH_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': '签署 PDF',
  'esign.tool.createSignature': '创建签名',
  'esign.tool.fillAndSign': '填写并签署 PDF',
  'esign.tool.addDateInitials': '添加日期与姓名缩写',

  'esign.panel.document': 'PDF 文档',
  'esign.panel.signatureLibrary': '会话签名',
  'esign.panel.elementsToolbar': '签署工具',
  'esign.panel.output': '已签署文档与导出',
  'esign.panel.pages': '页面',

  'esign.upload.dropPrompt': '点击上传或拖放 PDF 文件到此处',
  'esign.upload.replacePrompt': '点击或拖放 PDF 以替换文档',
  'esign.upload.hint': '100% 浏览器本地处理 · 最大支持 250 MB',
  'esign.upload.passwordPrompt': '此 PDF 受密码保护，请输入密码以查看和签署。',
  'esign.upload.passwordPlaceholder': '输入 PDF 密码...',
  'esign.upload.unlockButton': '解锁 PDF',
  'esign.upload.imageDropPrompt': '上传 PNG 或 JPEG 签名图片',
  'esign.upload.imageHint': '透明 PNG 或清晰 JPEG · 最大 10 MB',

  'esign.mode.draw': '手写',
  'esign.mode.type': '输入',
  'esign.mode.upload': '上传',
  'esign.draw.placeholder': '使用鼠标或触摸在此处绘制签名',
  'esign.type.nameLabel': '输入您的签名',
  'esign.type.namePlaceholder': '陈明',
  'esign.type.initialsPlaceholder': 'CM',
  'esign.type.fontLabel': '签名样式',
  'esign.type.colorLabel': '墨水颜色',
  'esign.upload.removeBg': '移除白色背景',
  'esign.preview.transparent': '透明 PNG 预览',

  'esign.element.signature': '签名',
  'esign.element.initials': '姓名缩写',
  'esign.element.date': '日期',
  'esign.element.text': '文本',
  'esign.element.checkmark': '勾选标记',
  'esign.element.textPlaceholder': '输入文本...',
  'esign.element.dateFormat': '日期格式',
  'esign.element.fontSize': '字体大小',

  'esign.action.addSignature': '添加签名',
  'esign.action.addInitials': '添加缩写',
  'esign.action.addDate': '添加日期',
  'esign.action.addText': '添加文本',
  'esign.action.addCheckmark': '添加勾选',
  'esign.action.createSignature': '创建签名',
  'esign.action.createInitials': '创建缩写',
  'esign.action.saveToSession': '保存到当前会话',
  'esign.action.useSignature': '应用签名',
  'esign.action.downloadPng': '下载透明 PNG',
  'esign.action.openSignPdf': '使用此签名签署 PDF',
  'esign.action.clearPad': '清除',
  'esign.action.undo': '撤销',
  'esign.action.redo': '重做',
  'esign.action.deleteElement': '删除',
  'esign.action.duplicateElement': '复制',
  'esign.action.applyAllPages': '应用到所有页面',
  'esign.action.resetDocument': '重置',
  'esign.action.clearSession': '清除会话',
  'esign.action.exportPdf': '导出已签署 PDF',
  'esign.action.exporting': '正在生成已签署 PDF...',
  'esign.action.downloadSignedPdf': '下载已签署 PDF',
  'esign.action.prevPage': '上一页',
  'esign.action.nextPage': '下一页',
  'esign.action.zoomIn': '放大',
  'esign.action.zoomOut': '缩小',
  'esign.action.close': '关闭',

  'esign.status.ready': '准备签署',
  'esign.status.readyHint': '上传 PDF，在页面上放置签名或字段，然后点击“导出已签署 PDF”。',
  'esign.status.pageOf': '第 {current} / {total} 页',
  'esign.status.elementsCount': '已放置 {count} 项',
  'esign.status.sessionReady': '已保存在当前浏览器会话中',
  'esign.status.sessionEmpty': '当前会话尚未保存签名',
  'esign.status.sessionCleared': '已从内存中清除会话签名。',
  'esign.status.savedToSession': '已保存签名供本次会话使用。',
  'esign.status.exportSuccess': '已生成并验证签署后的 PDF。',
  'esign.status.appliedAllPages': '已将选中项应用到所有页面。',
  'esign.status.loadingPdf': '正在本地加载 PDF 页面...',
  'esign.status.renderingPage': '正在渲染页面...',

  'esign.notice.localPrivacy': '文件和签名仅保留在您的浏览器内存中，绝不会上传到服务器。',
  'esign.notice.visualScope': '仅提供可视电子签名，不包含加密 PKI/X.509 数字证书。',

  'esign.error.emptySignature': '请先绘制、输入或上传签名。',
  'esign.error.noPdfUploaded': '导出前请先上传 PDF 文档。',
  'esign.error.noElementsPlaced': '导出前请至少放置一个签名、缩写、日期、文本或勾选标记。',
  'esign.error.unsupportedImage': '无效或不支持的图片格式，请上传有效的 PNG 或 JPEG 文件。',
  'esign.error.invalidPdf': '所选文件不是有效或可读的 PDF 文档。',
  'esign.error.passwordRequired': '打开此加密 PDF 需要有效的密码。',
  'esign.error.exportFailed': '无法导出已签署的 PDF 文档。'
};

const PL_ESIGN: ESignTranslations = {
  'esign.tool.signPdf': 'Podpisz PDF',
  'esign.tool.createSignature': 'Utwórz Podpis',
  'esign.tool.fillAndSign': 'Wypełnij i Podpisz PDF',
  'esign.tool.addDateInitials': 'Dodaj Datę i Inicjały',

  'esign.panel.document': 'Dokument PDF',
  'esign.panel.signatureLibrary': 'Podpis Sesji',
  'esign.panel.elementsToolbar': 'Narzędzia Podpisywania',
  'esign.panel.output': 'Podpisany Dokument i Eksport',
  'esign.panel.pages': 'Strony',

  'esign.upload.dropPrompt': 'Kliknij lub upuść plik PDF tutaj',
  'esign.upload.replacePrompt': 'Kliknij lub upuść PDF, aby zamienić dokument',
  'esign.upload.hint': 'Przetwarzanie w 100% lokalnie w przeglądarce · Do 250 MB',
  'esign.upload.passwordPrompt': 'Ten plik PDF jest chroniony hasłem. Wprowadź hasło, aby go otworzyć i podpisać.',
  'esign.upload.passwordPlaceholder': 'Wpisz hasło PDF...',
  'esign.upload.unlockButton': 'Odblokuj PDF',
  'esign.upload.imageDropPrompt': 'Prześlij obraz podpisu PNG lub JPEG',
  'esign.upload.imageHint': 'Przezroczysty PNG lub czysty JPEG · Maks. 10 MB',

  'esign.mode.draw': 'Rysuj',
  'esign.mode.type': 'Wpisz',
  'esign.mode.upload': 'Prześlij',
  'esign.draw.placeholder': 'Narysuj podpis myszą lub dotykiem',
  'esign.type.nameLabel': 'Wpisz swój podpis',
  'esign.type.namePlaceholder': 'Jan Kowalski',
  'esign.type.initialsPlaceholder': 'JK',
  'esign.type.fontLabel': 'Styl Podpisu',
  'esign.type.colorLabel': 'Kolor Tuszu',
  'esign.upload.removeBg': 'Usuń białe tło',
  'esign.preview.transparent': 'Podgląd Przezroczystego PNG',

  'esign.element.signature': 'Podpis',
  'esign.element.initials': 'Inicjały',
  'esign.element.date': 'Data',
  'esign.element.text': 'Tekst',
  'esign.element.checkmark': 'Znacznik',
  'esign.element.textPlaceholder': 'Wpisz tekst...',
  'esign.element.dateFormat': 'Format Daty',
  'esign.element.fontSize': 'Rozmiar Czcionki',

  'esign.action.addSignature': 'Dodaj Podpis',
  'esign.action.addInitials': 'Dodaj Inicjały',
  'esign.action.addDate': 'Dodaj Datę',
  'esign.action.addText': 'Dodaj Tekst',
  'esign.action.addCheckmark': 'Dodaj Znacznik',
  'esign.action.createSignature': 'Utwórz Podpis',
  'esign.action.createInitials': 'Utwórz Inicjały',
  'esign.action.saveToSession': 'Zapisz w Sesji',
  'esign.action.useSignature': 'Zastosuj Podpis',
  'esign.action.downloadPng': 'Pobierz Przezroczysty PNG',
  'esign.action.openSignPdf': 'Podpisz PDF Tym Podpisem',
  'esign.action.clearPad': 'Wyczyść',
  'esign.action.undo': 'Cofnij',
  'esign.action.redo': 'Ponów',
  'esign.action.deleteElement': 'Usuń',
  'esign.action.duplicateElement': 'Duplikuj',
  'esign.action.applyAllPages': 'Zastosuj na Wszystkich Stronach',
  'esign.action.resetDocument': 'Resetuj',
  'esign.action.clearSession': 'Wyczyść Sesję',
  'esign.action.exportPdf': 'Eksportuj Podpisany PDF',
  'esign.action.exporting': 'Generowanie podpisanego PDF...',
  'esign.action.downloadSignedPdf': 'Pobierz Podpisany PDF',
  'esign.action.prevPage': 'Poprzednia Strona',
  'esign.action.nextPage': 'Następna Strona',
  'esign.action.zoomIn': 'Powiększ',
  'esign.action.zoomOut': 'Pomniejsz',
  'esign.action.close': 'Zamknij',

  'esign.status.ready': 'Gotowe do Podpisania',
  'esign.status.readyHint': 'Prześlij plik PDF, umieść podpis lub pola na dowolnej stronie i kliknij Eksportuj Podpisany PDF.',
  'esign.status.pageOf': 'Strona {current} z {total}',
  'esign.status.elementsCount': 'Umieszczono elementów: {count}',
  'esign.status.sessionReady': 'Zapisano w bieżącej sesji przeglądarki',
  'esign.status.sessionEmpty': 'Brak zapisanego podpisu w tej sesji',
  'esign.status.sessionCleared': 'Podpisy sesji zostały usunięte z pamięci.',
  'esign.status.savedToSession': 'Podpis zapisany dla bieżącej sesji.',
  'esign.status.exportSuccess': 'Wygenerowano i zweryfikowano podpisany PDF.',
  'esign.status.appliedAllPages': 'Zastosowano zaznaczony element na wszystkich stronach.',
  'esign.status.loadingPdf': 'Ładowanie stron PDF lokalnie...',
  'esign.status.renderingPage': 'Renderowanie strony...',

  'esign.notice.localPrivacy': 'Pliki i podpisy pozostają w pamięci przeglądarki i nigdy nie są wysyłane na serwer.',
  'esign.notice.visualScope': 'Tylko wizualny podpis elektroniczny — bez kryptograficznego certyfikatu PKI/X.509.',

  'esign.error.emptySignature': 'Najpierw narysuj, wpisz lub prześlij podpis.',
  'esign.error.noPdfUploaded': 'Prześlij dokument PDF przed eksportem.',
  'esign.error.noElementsPlaced': 'Umieść co najmniej jeden podpis, inicjały, datę, tekst lub znacznik przed eksportem.',
  'esign.error.unsupportedImage': 'Nieprawidłowy lub nieobsługiwany obraz. Prześlij prawidłowy plik PNG lub JPEG.',
  'esign.error.invalidPdf': 'Wybrany plik nie jest prawidłowym lub czytelnym dokumentem PDF.',
  'esign.error.passwordRequired': 'Wymagane jest prawidłowe hasło, aby otworzyć zaszyfrowany plik PDF.',
  'esign.error.exportFailed': 'Nie udało się wyeksportować podpisanego dokumentu PDF.'
};

export const ESIGN_TRANSLATIONS: Record<Language, ESignTranslations> = {
  en: EN_ESIGN,
  es: ES_ESIGN,
  fr: FR_ESIGN,
  pt: PT_ESIGN,
  de: DE_ESIGN,
  it: IT_ESIGN,
  ja: JA_ESIGN,
  zh: ZH_ESIGN,
  pl: PL_ESIGN
};

export function getESignText(
  language: Language,
  key: keyof ESignTranslations,
  vars?: Record<string, string | number>
): string {
  const dict = ESIGN_TRANSLATIONS[language] || ESIGN_TRANSLATIONS.en;
  let template = dict[key] || ESIGN_TRANSLATIONS.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return template;
}
