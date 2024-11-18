  import React, { useState, useEffect } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput } from 'react-native';
  import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
  import { db, auth } from '../config/firebase'; 
  import { onAuthStateChanged } from 'firebase/auth';
  import DropDownPicker from 'react-native-dropdown-picker';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

  export default function JournalScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [userId, setUserId] = useState(null);

    const categories = [
      { label: 'Study', value: 'Study' },
      { label: 'Exercise', value: 'Exercise' },
      { label: 'Diet', value: 'Diet' },
      { label: 'Others', value: 'Others' },
    ];

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          fetchNotes(user.uid);
        }
      });
      return unsubscribe;
    }, []);

    const fetchNotes = (userId) => {
      const notesQuery = query(collection(db, 'notes'), where('userId', '==', userId));
      onSnapshot(notesQuery, (snapshot) => {
        const userNotes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotes(userNotes);
      });
    };

    const handleAddNote = async () => {
      if (title && category) {
        await addDoc(collection(db, 'notes'), {
          title,
          category,
          content: title,
          date: new Date().toISOString(),
          userId,
        });
        setTitle('');
        setCategory(null);
        setModalVisible(false);
      }
    };

    const handleDeleteNote = async (id) => {
      await deleteDoc(doc(db, 'notes', id));
    };

    return (
      <View style={styles.container}>
        <Text style={styles.header}>journal.</Text>
        
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ alignItems: 'center' }} 
          renderItem={({ item }) => (
            <View style={styles.note}>
              <View style={styles.noteTextContainer}>
                <Text style={styles.noteCategory}>{item.category}</Text>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleDeleteNote(item.id)} 
                style={styles.deleteButton}
              >
                <Icon name="delete" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add Notes</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DropDownPicker
                open={openDropdown}
                value={category}
                items={categories}
                setOpen={setOpenDropdown}
                setValue={setCategory}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Select Category"
              />
              <TextInput
                placeholder="Add note to your journal"
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { marginTop: 20 }]}
                multiline={true}
                numberOfLines={2}
              />
              <TouchableOpacity style={styles.modalAddButton} onPress={handleAddNote}>
                <Text style={styles.modalAddButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E1EFEF',
      alignItems: 'center',
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginTop: 70,
      marginBottom: 20,
    },
    addButton: {
      backgroundColor: '#2d2d2d',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      position: 'absolute',
      bottom: 50,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '500',
    },
    note: {
      backgroundColor: '#fff',
      padding: 15,
      marginVertical: 8,
      borderRadius: 20,
      width: '95%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      },
    noteTextContainer: {
      flex: 1,
    },
    noteCategory: {
      fontSize: 14,
      color: '#777',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    noteTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    noteDate: {
      fontSize: 14,
      color: '#777',
    },
    deleteButton: {
      backgroundColor: '#ff5252',
      padding: 8,
      borderRadius: 20,
      marginLeft: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 20,
      width: '100%',
    },
    dropdown: {
      borderRadius: 20,
      borderColor: '#ccc',
    },
    dropdownContainer: {
      borderColor: '#ccc',
    },
    modalAddButton: {
      backgroundColor: '#2d2d2d',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      marginTop: 20,
    },
    modalAddButtonText: {
      color: '#fff',
      fontSize: 14,
      textAlign: 'center',
    },
    modalCloseButton: {
      marginTop: 10,
      color: '#2d2d2d',
      textAlign: 'center',
    },
  });

