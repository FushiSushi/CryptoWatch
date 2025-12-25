import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// 📦 Import des modules externes (Module 4 & 5)
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Clé pour le stockage local
const FAVORITES_KEY = '@my_favorites_ids';

// Types pour TypeScript
interface User {
  id: number;
  name: string;
  email: string;
}

export default function HomeScreen() {
  // --- ÉTATS (STATE) ---
  const [users, setUsers] = useState<User[]>([]); // Données API
  const [favorites, setFavorites] = useState<number[]>([]); // Liste des ID favoris
  const [isLoading, setIsLoading] = useState(true); // Indicateur de chargement
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Défi 1: Filtrage
  const [newUserName, setNewUserName] = useState(''); // Défi 3: Formulaire (nom)
  const [newUserEmail, setNewUserEmail] = useState(''); // Défi 3: Formulaire (email)

  // --- LOGIQUE MÉTIER ---
  // 1. Fonction pour charger les données (API + Storage)
  const loadData = async () => {
    setIsLoading(true);
    try {
      // A. Appel API avec Axios (Module 4)
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      setUsers(response.data);

      // B. Chargement des favoris locaux (Module 5)
      const storedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs)); // Conversion JSON -> Tableau
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
      console.error(error);
    } finally {
      setIsLoading(false); // Arrêt du chargement quoi qu'il arrive
    }
  };

  // --- CYCLE DE VIE (EFFECTS) ---
  // useEffect s'exécute après le premier rendu pour charger les données
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] = S'exécute une seule fois au montage

  // 2. Gestion des Favoris (Ajout/Retrait + Persistance)
  const toggleFavorite = async (userId: number) => {
    try {
      let newFavorites: number[];
      if (favorites.includes(userId)) {
        // Si déjà favori, on le retire
        newFavorites = favorites.filter((id: number) => id !== userId);
      } else {
        // Sinon, on l'ajoute
        newFavorites = [...favorites, userId];
      }

      // Mise à jour du State (Interface réactive)
      setFavorites(newFavorites);

      // Mise à jour du Storage (Persistance)
      // JSON.stringify est obligatoire car AsyncStorage ne stocke que des Strings
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
    }
  };

  // 3. Défi "Sécurité" : Fonction pour effacer tous les favoris
  const clearAllFavorites = async () => {
    try {
      // Confirmation avant suppression
      Alert.alert(
        "Confirmation",
        "Voulez-vous vraiment effacer tous les favoris ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Effacer",
            style: "destructive",
            onPress: async () => {
              // Suppression du stockage local
              await AsyncStorage.removeItem(FAVORITES_KEY);
              // Réinitialisation de l'état local
              setFavorites([]);
              Alert.alert("Succès", "Tous les favoris ont été effacés");
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'effacement", error);
      Alert.alert("Erreur", "Impossible d'effacer les favoris");
    }
  };

  // 4. Défi "API POST" : Fonction pour ajouter un utilisateur
  const addUser = async () => {
    // Validation des champs
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      // Appel POST à l'API (Module 4 - Méthode POST)
      const response = await axios.post('https://jsonplaceholder.typicode.com/users', {
        name: newUserName,
        email: newUserEmail,
      });

      // L'API JSONPlaceholder simule l'ajout et renvoie un ID
      const newUser: User = response.data;
      
      // Ajout de l'utilisateur à la liste locale
      setUsers([newUser, ...users]); // Ajout au début de la liste
      
      // Réinitialisation du formulaire
      setNewUserName('');
      setNewUserEmail('');
      
      Alert.alert("Succès", `Utilisateur ${newUser.name} ajouté avec l'ID ${newUser.id}`);
    } catch (error) {
      console.error("Erreur lors de l'ajout", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'utilisateur");
    }
  };

  // 5. Défi "Filtrage" : Fonction pour filtrer les utilisateurs
  const getFilteredUsers = (): User[] => {
    if (showOnlyFavorites) {
      // Ne retourner que les utilisateurs favoris
      return users.filter((user: User) => favorites.includes(user.id));
    }
    return users; // Retourner tous les utilisateurs
  };

  // --- RENDU GRAPHIQUE (RENDER) ---
  // Composant pour un item de la liste
  const renderItem = ({ item }: { item: User }) => {
    const isFav = favorites.includes(item.id);
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={[styles.favButton, isFav ? styles.favActive : styles.favInactive]}
        >
          <Text style={styles.favText}>{isFav ? "★" : "☆"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Affichage principal
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mon Répertoire API</Text>
      
      {isLoading ? (
        // Affichage du spinner pendant le chargement
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Chargement des contacts...</Text>
        </View>
      ) : (
        <>
          {/* Défi 3: Formulaire d'ajout d'utilisateur */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>➕ Ajouter un utilisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              value={newUserName}
              onChangeText={setNewUserName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addButton} onPress={addUser}>
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {/* Défi 1 & 2: Boutons de filtrage et d'effacement */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, showOnlyFavorites && styles.actionButtonActive]}
              onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
            >
              <Text style={styles.actionButtonText}>
                {showOnlyFavorites ? " Afficher tout" : " Afficher favoris"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={clearAllFavorites}
            >
              <Text style={styles.actionButtonText}> Effacer tout</Text>
            </TouchableOpacity>
          </View>

          {/* Liste avec filtrage appliqué */}
          <FlatList
            data={getFilteredUsers()}
            keyExtractor={(item: User) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun favori pour le moment</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Styles du formulaire (Défi 3)
  formContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  // Styles des boutons d'action (Défi 1 & 2)
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#0056b3',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  
  // Styles de la liste
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2, // Ombre Android
    shadowColor: '#000', // Ombre iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666', marginTop: 4 },
  favButton: { padding: 10, borderRadius: 20 },
  favActive: { backgroundColor: '#fff3cd' }, // Jaune clair
  favInactive: { backgroundColor: '#f0f0f0' }, // Gris clair
  favText: { fontSize: 24, color: '#f1c40f' },
  
  // Style pour liste vide
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16, color: '#999', fontStyle: 'italic' },
});
