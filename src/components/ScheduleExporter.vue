<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Export Schedule</span>
        <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
      </v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="format in exportFormats"
            :key="format.type"
            @click="exportSchedule(format.type)"
          >
            <template v-slot:prepend>
              <v-icon :color="format.color">{{ format.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ format.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ format.description }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const props = defineProps({
  modelValue: Boolean,
  schedule: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const dialog = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
});

watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});

const exportFormats = [
  {
    type: 'pdf',
    title: 'Export as PDF',
    description: 'Download your schedule as a PDF document',
    icon: 'mdi-file-pdf-box',
    color: 'red'
  },
  {
    type: 'ical',
    title: 'Export as iCal',
    description: 'Download your schedule as an iCal file for calendar apps',
    icon: 'mdi-calendar',
    color: 'blue'
  },
  {
    type: 'csv',
    title: 'Export as CSV',
    description: 'Download your schedule as a CSV file',
    icon: 'mdi-file-delimited',
    color: 'green'
  }
];

const exportSchedule = async (format) => {
  try {
    switch (format) {
      case 'pdf':
        await exportAsPDF();
        break;
      case 'ical':
        await exportAsICal();
        break;
      case 'csv':
        await exportAsCSV();
        break;
    }
    dialog.value = false;
  } catch (error) {
    console.error('Error exporting schedule:', error);
    alert('Failed to export schedule. Please try again.');
  }
};

const exportAsPDF = async () => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('My Schedule', 105, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
  
  // Add course list
  doc.setFontSize(14);
  doc.text('Courses', 20, 45);
  
  autoTable(doc, {
    startY: 50,
    head: [['Course Code']],
    body: props.schedule.courses.map(course => [course]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 12 }
  });
  
  // Create grid schedule
  doc.setFontSize(14);
  doc.text('Weekly Schedule', 20, doc.lastAutoTable.finalY + 20);
  
  // Get all unique time slots from the schedule
  const timeSet = new Set();
  props.schedule.days.forEach(day => {
    const [, time] = day.split(' ');
    const [startTime] = time.split('-');
    timeSet.add(startTime);
  });
  
  // Sort time slots
  const timeSlots = Array.from(timeSet).sort();
  
  // Create grid data
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const gridData = [];
  
  // Add header row with time slots
  const headerRow = ['Day', ...timeSlots];
  gridData.push(headerRow);
  
  // Process each day
  days.forEach(day => {
    const dayRow = [day];
    
    // Initialize all time slots as empty
    timeSlots.forEach(() => {
      dayRow.push('');
    });
    
    // Fill in the courses for this day
    props.schedule.days.forEach(scheduleDay => {
      const [dayName, time] = scheduleDay.split(' ');
      if (dayName.toLowerCase() === day.toLowerCase()) {
        const [startTime] = time.split('-');
        const course = props.schedule.courses.find(course => {
          return props.schedule.days.some(d => {
            const [dDay, dTime] = d.split(' ');
            return dDay === dayName && dTime === time;
          });
        });
        
        // Find the time slot index
        const timeIndex = timeSlots.indexOf(startTime);
        if (timeIndex !== -1 && course) {
          dayRow[timeIndex + 1] = course;
        }
      }
    });
    
    gridData.push(dayRow);
  });
  
  // Create the grid table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 25,
    head: [gridData[0]],
    body: gridData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 30 }, // Day column
      // Other columns will auto-size
    },
    didDrawCell: (data) => {
      // Add background color for cells with courses
      if (data.cell.raw && data.column.index > 0) {
        doc.setFillColor(230, 230, 230);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
      }
    }
  });
  
  // Save the PDF
  doc.save('schedule.pdf');
};

const exportAsICal = async () => {
  const icalContent = generateICalContent();
  const blob = new Blob([icalContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportAsCSV = async () => {
  const csvContent = generateCSVContent();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schedule.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const generateICalContent = () => {
  let ical = 'BEGIN:VCALENDAR\n';
  ical += 'VERSION:2.0\n';
  ical += 'PRODID:-//University Scheduler//EN\n';

  props.schedule.days.forEach((day, index) => {
    const [dayName, time] = day.split(' ');
    const [startTime, endTime] = time.split('-');
    const course = props.schedule.courses.find(c => {
      return props.schedule.days.some(d => {
        const [dDay, dTime] = d.split(' ');
        return dDay === dayName && dTime === time;
      });
    });

    if (course) {
      ical += 'BEGIN:VEVENT\n';
      ical += `UID:${index}@university-scheduler\n`;
      ical += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '')}\n`;
      ical += `DTSTART:${getICalDate(dayName, startTime)}\n`;
      ical += `DTEND:${getICalDate(dayName, endTime)}\n`;
      ical += `SUMMARY:${course}\n`;
      ical += 'END:VEVENT\n';
    }
  });

  ical += 'END:VCALENDAR';
  return ical;
};

const generateCSVContent = () => {
  let csv = 'Day,Time,Course\n';
  props.schedule.days.forEach(day => {
    const [dayName, time] = day.split(' ');
    const course = props.schedule.courses.find(c => {
      return props.schedule.days.some(d => {
        const [dDay, dTime] = d.split(' ');
        return dDay === dayName && dTime === time;
      });
    });
    csv += `${dayName},${time},${course || ''}\n`;
  });
  return csv;
};

const getICalDate = (dayName, time) => {
  const days = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5
  };
  const dayNumber = days[dayName.toLowerCase()];
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setDate(date.getDate() + (dayNumber - date.getDay()));
  date.setHours(parseInt(hours), parseInt(minutes), 0);
  return date.toISOString().replace(/[-:]/g, '');
};

const formatDay = (day) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};
</script> 