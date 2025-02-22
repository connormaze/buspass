import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function Students() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setError(null);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'students'),
        where('schoolId', '==', currentUser.schoolId)
      );
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Check if parent email exists in users collection
      const parentQuery = query(
        collection(db, 'users'),
        where('email', '==', data.parentEmail),
        where('role', '==', 'PARENT')
      );
      const parentSnapshot = await getDocs(parentQuery);
      let parentId = null;

      if (!parentSnapshot.empty) {
        parentId = parentSnapshot.docs[0].id;
      }

      // Create student document
      const studentRef = await addDoc(collection(db, 'students'), {
        firstName: data.firstName,
        lastName: data.lastName,
        grade: data.grade,
        parentEmail: data.parentEmail,
        parentId: parentId, // Will be null if parent doesn't exist yet
        schoolId: currentUser.schoolId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser.uid,
        updatedBy: currentUser.uid,
      });

      // If parent exists, update their document with this student
      if (parentId) {
        const parentRef = doc(db, 'users', parentId);
        const parentDoc = await getDoc(parentRef);
        if (parentDoc.exists()) {
          const currentStudents = parentDoc.data().students || [];
          await updateDoc(parentRef, {
            students: [...currentStudents, studentRef.id],
            updatedAt: new Date(),
            updatedBy: currentUser.uid,
          });
        }
      }

      setSuccess('Student added successfully');
      handleCloseDialog();
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle parent account creation/linking
  const handleParentAccountCreated = async (parentId, parentEmail) => {
    try {
      // Find all students with this parent's email
      const studentsQuery = query(
        collection(db, 'students'),
        where('parentEmail', '==', parentEmail),
        where('schoolId', '==', currentUser.schoolId)
      );
      const studentsSnapshot = await getDocs(studentsQuery);

      if (!studentsSnapshot.empty) {
        // Get all student IDs
        const studentIds = studentsSnapshot.docs.map(doc => doc.id);

        // Update parent's document with all associated students
        const parentRef = doc(db, 'users', parentId);
        await updateDoc(parentRef, {
          students: studentIds,
          updatedAt: new Date(),
          updatedBy: currentUser.uid,
        });

        // Update all student documents with the parent ID
        await Promise.all(
          studentsSnapshot.docs.map(studentDoc => 
            updateDoc(doc(db, 'students', studentDoc.id), {
              parentId: parentId,
              updatedAt: new Date(),
              updatedBy: currentUser.uid,
            })
          )
        );
      }
    } catch (error) {
      console.error('Error linking parent to students:', error);
    }
  }; 
} 