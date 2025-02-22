import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import StudentProfilePicture from '../../components/StudentProfilePicture';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const QR_REFRESH_INTERVAL = 30000;

export default function StudentQR({ students, onUpdate }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openQR, setOpenQR] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    let countdownTimer;
    let refreshTimer;

    if (openQR && selectedStudent) {
      // Generate initial QR data
      setQrData(generateQRData(selectedStudent));
      setCountdown(30);
      
      // Update countdown every second
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Generate new QR data when countdown hits 0
            setQrData(generateQRData(selectedStudent));
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(countdownTimer);
    };
  }, [openQR, selectedStudent]);

  const handleOpenQR = (student) => {
    setSelectedStudent(student);
    setOpenQR(true);
  };

  const handleCloseQR = () => {
    setOpenQR(false);
    setSelectedStudent(null);
    setCountdown(30);
    setQrData('');
  };

  const generateQRData = (student) => {
    // Generate a secure QR code data structure with timestamp
    const data = {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      grade: student.grade,
      timestamp: new Date().toISOString(),
      refreshKey: Date.now(), // Add unique key for each refresh
      profilePicture: student.profilePicture || null,
    };
    return JSON.stringify(data);
  };

  const handleProfilePictureUpdate = async (studentId, pictureUrl) => {
    try {
      await updateDoc(doc(db, 'users', studentId), {
        profilePicture: pictureUrl,
      });
      
      // Call the parent's onUpdate to refresh the students list
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  if (!students.length) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6">No students registered</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Student QR Codes
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Use these QR codes for student pickup verification. Each code is unique and refreshes every 30 seconds for security.
      </Typography>

      <Grid container spacing={3}>
        {students.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card>
              <CardContent>
                <StudentProfilePicture
                  student={student}
                  onUpdate={(url) => handleProfilePictureUpdate(student.id, url)}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {student.firstName} {student.lastName}
                </Typography>
                <Typography color="textSecondary">
                  Grade {student.grade}
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <QRCode
                    id={`qr-preview-${student.id}`}
                    value={generateQRData(student)}
                    size={128}
                    level="H"
                    includeMargin
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleOpenQR(student)}
                >
                  View Full Size
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openQR}
        onClose={handleCloseQR}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedStudent && `${selectedStudent.firstName}'s QR Code`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            {selectedStudent && qrData && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Code refreshes in: {countdown} seconds
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(countdown / 30) * 100} 
                    sx={{ mt: 1 }}
                  />
                </Box>
                {selectedStudent.profilePicture && (
                  <Box sx={{ mb: 2 }}>
                    <StudentProfilePicture
                      student={selectedStudent}
                      readOnly={true}
                    />
                  </Box>
                )}
                <QRCode
                  id={`qr-${selectedStudent.id}`}
                  value={qrData}
                  size={256}
                  level="H"
                  includeMargin
                />
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
} 