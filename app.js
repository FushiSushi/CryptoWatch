import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';

// Import des modules externes
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé pour le stockage local
const FAVORITES_KEY = '@my_favorites_ids';

export default function App() {
  // --- STATES ---
  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- EFFECT ---
  useEffect(() => {
    loadData();
  }, []);

  // --- LOGIQUE ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Appel API
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/users'
      );
      setUsers(response.data);

      // Chargement des favoris depuis AsyncStorage
      const storedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des favoris
  const toggleFavorite = async (userId) => {
    try {
      let newFavorites;

      if (favorites.includes(userId)) {
        newFavorites = favorites.filter(id => id !== userId);
      } else {
        newFavorites = [...favorites, userId];
      }

      setFavorites(newFavorites);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(newFavorites)
      );
    } catch (error) {
      console.error('Erreur de sauvegarde', error);
    }
  };

  // --- RENDER ITEM ---
  const renderItem = ({ item }) => {
    const isFav = favorites.includes(item.id);

    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>

        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={[
            styles.favButton,
            isFav ? styles.favActive : styles.favInactive
          ]}
        >
          <Text style={styles.favText}>
            {isFav ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- UI ---
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mon Répertoire API</Text>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
          <Text>Chargement des contacts...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    paddingHorizontal: 16
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  favButton: {
    padding: 10,
    borderRadius: 20
  },
  favActive: {
    backgroundColor: '#fff3cd'
  },
  favInactive: {
    backgroundColor: '#f0f0f0'
  },
  favText: {
    fontSize: 24,
    color: '#f1c40f'
  }
});
