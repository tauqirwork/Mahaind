function summarizeAttendance(attendanceRecords) {
  const counts = {
    wfh_days: 0, onsite_days: 0, al_taken: 0, hd_taken: 0,
    ph_days: 0, comp_off_days: 0, week_offs: 0, sick_leave_days: 0
  };

  for (const record of attendanceRecords) {
    switch (record.status) {
      case 'WFH':         counts.wfh_days++;        break;
      case 'Onsite':      counts.onsite_days++;      break;
      case 'AL':          counts.al_taken++;         break;
      case 'HD':          counts.hd_taken++;         break;
      case 'PH':          counts.ph_days++;          break;
      case 'Comp Off':    counts.comp_off_days++;    break;
      case 'Week Off':    counts.week_offs++;        break;
      case 'Sick Leave':  counts.sick_leave_days++;  break;
    }
  }

  // Working days = WFH + Onsite + HD×0.5 + CompOff
  counts.working_days = counts.wfh_days + counts.onsite_days
    + (counts.hd_taken * 0.5) + counts.comp_off_days;

  // Total leave days = AL + HD×0.5 + PH + SL
  counts.total_leaves = counts.al_taken + (counts.hd_taken * 0.5)
    + counts.ph_days + counts.sick_leave_days;

  return counts;
}

module.exports = { summarizeAttendance };
