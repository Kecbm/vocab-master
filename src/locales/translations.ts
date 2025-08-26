export const translations = {
  english: {
    // Header
    appTitle: "Vocab Master",
    appSubtitle: "Learning English by Reading Books",
    
    // Search
    searchPlaceholder: "Type an English word...",
    addButton: "Add",
    wordFound: "Word found",
    newDiscovery: "New discovery",
    
    // Filters
    sort: "Sort:",
    sortAZ: "A-Z",
    sortRecent: "Recent",
    filter: "Filter:",
    filterAll: "All",
    filterNew: "New",
    filterLearning: "Learning",
    filterMastered: "Mastered",
    
    // Statistics
    total: "Total",
    learning: "Learning",
    mastered: "Mastered",
    books: "Books",
    
    // Current Book
    currentBook: "Current Book",
    currentBookPlaceholder: "Ex: Django 5 by example",
    clearCurrentBook: "Clear current book",
    finishCurrentBook: "Finish current book",
    newWordsAssociated: "New words will be associated with this book",
    
    // Completed Books
    completedBooks: "Completed Books",
    wordsCount: "words",
    
    // Pagination
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    noWordsFound: "No words found",
    
    // Add Word Modal
    addNewWord: "Add New Word",
    englishWord: "English Word",
    englishWordRequired: "English word is required",
    portugueseTranslation: "Portuguese Translation",
    translationRequired: "Translation is required",
    bookName: "Book Name",
    bookNameRequired: "Book name is required",
    retranslate: "Retranslate",
    translating: "Translating...",
    cancel: "Cancel",
    addWord: "Add Word",
    
    // Edit Word Modal
    editWord: "Edit Word",
    saveChanges: "Save Changes",
    
    // Delete Modal
    deleteWord: "Delete Word",
    deleteConfirmation: "Are you sure you want to delete this word?",
    deleteWarning: "This action cannot be undone.",
    delete: "Delete",
    
    // Toast Messages
    wordAdded: "Word added!",
    wordAddedDescription: "was added to your vocabulary.",
    wordUpdated: "Word updated!",
    wordUpdatedDescription: "was updated successfully.",
    wordRemoved: "Word removed",
    wordRemovedDescription: "was removed from your vocabulary.",
    wordMastered: "Word mastered!",
    backToLearning: "Back to learning",
    masteredDescription: "was marked as mastered",
    learningDescription: "is back to learning",
    bookFinished: "Book finished!",
    bookFinishedDescription: "was moved to completed books",
    
    // Error Messages
    errorAddingWord: "Error adding word",
    errorUpdatingWord: "Error updating word",
    errorDeletingWord: "Error deleting word",
    errorSavingBook: "Error saving book",
    errorFinishingBook: "Error finishing book",
    checkServerRunning: "Check if the server is running",
    couldNotSaveChanges: "Could not save the changes",
    noBookToFinish: "No book to finish",
    setCurrentBookFirst: "Please set a current book first",
    
    // Loading
    loadingWords: "Loading words...",
  },
  
  french: {
    // Header
    appTitle: "Vocab Master",
    appSubtitle: "Apprendre le français en lisant des livres",
    
    // Search
    searchPlaceholder: "Tapez un mot français...",
    addButton: "Ajouter",
    wordFound: "Mot trouvé",
    newDiscovery: "Nouvelle découverte",
    
    // Filters
    sort: "Trier :",
    sortAZ: "A-Z",
    sortRecent: "Récent",
    filter: "Filtrer :",
    filterAll: "Tous",
    filterNew: "Nouveau",
    filterLearning: "Apprentissage",
    filterMastered: "Maîtrisé",
    
    // Statistics
    total: "Total",
    learning: "Apprentissage",
    mastered: "Maîtrisé",
    books: "Livres",
    
    // Current Book
    currentBook: "Livre actuel",
    currentBookPlaceholder: "Ex: Le Petit Prince",
    clearCurrentBook: "Effacer le livre actuel",
    finishCurrentBook: "Terminer le livre actuel",
    newWordsAssociated: "Les nouveaux mots seront associés à ce livre",
    
    // Completed Books
    completedBooks: "Livres terminés",
    wordsCount: "mots",
    
    // Pagination
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    of: "de",
    noWordsFound: "Aucun mot trouvé",
    
    // Add Word Modal
    addNewWord: "Ajouter un nouveau mot",
    englishWord: "Mot français",
    englishWordRequired: "Le mot français est requis",
    portugueseTranslation: "Traduction portugaise",
    translationRequired: "La traduction est requise",
    bookName: "Nom du livre",
    bookNameRequired: "Le nom du livre est requis",
    retranslate: "Retraduire",
    translating: "Traduction...",
    cancel: "Annuler",
    addWord: "Ajouter le mot",
    
    // Edit Word Modal
    editWord: "Modifier le mot",
    saveChanges: "Sauvegarder les modifications",
    
    // Delete Modal
    deleteWord: "Supprimer le mot",
    deleteConfirmation: "Êtes-vous sûr de vouloir supprimer ce mot ?",
    deleteWarning: "Cette action ne peut pas être annulée.",
    delete: "Supprimer",
    
    // Toast Messages
    wordAdded: "Mot ajouté !",
    wordAddedDescription: "a été ajouté à votre vocabulaire.",
    wordUpdated: "Mot mis à jour !",
    wordUpdatedDescription: "a été mis à jour avec succès.",
    wordRemoved: "Mot supprimé",
    wordRemovedDescription: "a été supprimé de votre vocabulaire.",
    wordMastered: "Mot maîtrisé !",
    backToLearning: "Retour à l'apprentissage",
    masteredDescription: "a été marqué comme maîtrisé",
    learningDescription: "est de retour à l'apprentissage",
    bookFinished: "Livre terminé !",
    bookFinishedDescription: "a été déplacé vers les livres terminés",
    
    // Error Messages
    errorAddingWord: "Erreur lors de l'ajout du mot",
    errorUpdatingWord: "Erreur lors de la mise à jour du mot",
    errorDeletingWord: "Erreur lors de la suppression du mot",
    errorSavingBook: "Erreur lors de la sauvegarde du livre",
    errorFinishingBook: "Erreur lors de la finalisation du livre",
    checkServerRunning: "Vérifiez si le serveur fonctionne",
    couldNotSaveChanges: "Impossible de sauvegarder les modifications",
    noBookToFinish: "Aucun livre à terminer",
    setCurrentBookFirst: "Veuillez d'abord définir un livre actuel",
    
    // Loading
    loadingWords: "Chargement des mots...",
  }
};

export type TranslationKey = keyof typeof translations.english;
