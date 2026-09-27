export const demoSummary = {
  totalViolations: 64,
  violators: 59,
  repeatOffenders: 5,
  suspendedLicenses: 3,
  activeSignals: 11,
  totalSignals: 12,
  priorityEvents: 7,
  uptime: '98.4%',
  disputes: 4,
}

export const demoIntersections = [
  { id: 'quezon', name: 'Quezon Avenue', status: 'NORMAL', level: 'green', nsState: 'Green', ewState: 'Stop', phaseSeconds: 18, vehicles: 21, pedestrians: 3 },
  { id: 'east', name: 'East Avenue', status: 'NORMAL', level: 'green', nsState: 'Stop', ewState: 'Green', phaseSeconds: 14, vehicles: 16, pedestrians: 2 },
  { id: 'west', name: 'West Avenue', status: 'CONGESTED', level: 'yellow', nsState: 'Stop', ewState: 'Green', phaseSeconds: 9, vehicles: 34, pedestrians: 4 },
  { id: 'north', name: 'North Avenue', status: 'NORMAL', level: 'green', nsState: 'Green', ewState: 'Stop', phaseSeconds: 22, vehicles: 12, pedestrians: 1 },
  { id: 'south', name: 'South Avenue', status: 'ALERT', level: 'red', nsState: 'Stop', ewState: 'Stop', phaseSeconds: 6, vehicles: 8, pedestrians: 5 },
  { id: 'comm', name: 'Comm. Avenue', status: 'NORMAL', level: 'green', nsState: 'Green', ewState: 'Stop', phaseSeconds: 16, vehicles: 19, pedestrians: 2 },
]

export const demoTrafficVolume = [
  { time: '7AM', volume: 24 },
  { time: '8AM', volume: 15 },
  { time: '9AM', volume: 98 },
  { time: '10AM', volume: 51 },
  { time: '11AM', volume: 123 },
  { time: '12PM', volume: 72 },
  { time: '1PM', volume: 38 },
  { time: '3PM', volume: 8 },
  { time: '5PM', volume: 30 },
  { time: '6PM', volume: 50 },
  { time: '7PM', volume: 84 },
]

export const demoSystemHealth = [
  { name: 'ESP8266 network link', state: 'Connected', icon: 'radio' },
  { name: 'HUSKYLENS 2 vision sensors', state: 'All online', icon: 'camera' },
  { name: 'Ultrasonic pedestrian sensors', state: 'All online', icon: 'activity' },
  { name: 'Emergency detection mic', state: 'Online', icon: 'siren' },
]

export const demoDashboardIntersections = [
  { id: 'quezon', details: 'North-South green · 21 vehicles · 3 pedestrian requests', tone: 'green' },
  { id: 'east', details: 'East-West green · 16 vehicles · 2 pedestrian requests', tone: 'green' },
  { id: 'west', details: '34 vehicles waiting · congestion detected', tone: 'amber' },
]

export const demoViolationEvents = [
  {
    id: 1,
    type: 'Red Light',
    location: 'Quezon Ave. Approach',
    time: '14:50',
    confidence: 98,
    plate: 'XYZ 9081',
    owner: 'Santos, Ederlino P.',
    address: '34 Aurora St., Brgy. New Era, QC',
    vehicle: 'Sedan • Toyota Vios • Silver',
    licenseStatus: 'Active',
    noticeTime: 'Today, 14:33',
    disposition: 'Review',
  },
  {
    id: 2,
    type: 'Distracted Driving',
    location: 'Commonwealth Approach',
    time: '14:52',
    confidence: 97,
    plate: 'NBD 8941',
    owner: 'Reyes, Marcus J.',
    address: '12 Commonwealth Ave, QC',
    vehicle: 'SUV • Mitsubishi Montero • Black',
    licenseStatus: 'Active',
    noticeTime: 'Today, 14:52',
    disposition: 'Dispute',
  },
  {
    id: 3,
    type: 'Blocking Pedestrian',
    location: 'East Ave. Approach',
    time: '14:59',
    confidence: 89,
    plate: 'ABC 1234',
    owner: 'Cruz, Angela M.',
    address: '88 East Ave, Diliman, QC',
    vehicle: 'Hatchback • Honda Jazz • White',
    licenseStatus: 'Active',
    noticeTime: 'Today, 14:59',
    disposition: 'Review',
  },
]

export const demoViolators = [
  {
    id: 1,
    name: 'Santos, Ederlino P.',
    shortName: 'Santos, Ederlino',
    licenseNumber: 'A00-00-00000',
    email: 'operator@gmail.com',
    plate: 'XYZ 9081',
    vehicle: 'Toyota Vios',
    fullVehicle: 'Sedan • Toyota Vios • Silver',
    address: '34 Aurora St., Brgy. New Era, QC',
    violations: 3,
    license: 'Active',
    historyId: '#1651 • Red Light',
    historyDetail: 'Quezon Ave. Approach • Today, 14:33',
    historyStatus: 'Upheld',
  },
  {
    id: 2,
    name: 'Reyes, Marcus J.',
    shortName: 'Reyes, Marcus',
    plate: 'NBD 8941',
    vehicle: 'Mitsubishi Montero',
    fullVehicle: 'SUV • Mitsubishi Montero • Black',
    address: '12 Commonwealth Ave, QC',
    violations: 2,
    license: 'Active',
    historyId: '#1648 • Distracted Driving',
    historyDetail: 'Commonwealth Ave • Yesterday, 17:15',
    historyStatus: 'Under review',
  },
  {
    id: 3,
    name: 'Cruz, Angela M.',
    shortName: 'Cruz, Angela',
    plate: 'ABC 1234',
    vehicle: 'Honda Jazz',
    fullVehicle: 'Hatchback • Honda Jazz • White',
    address: '88 East Ave, Diliman, QC',
    violations: 1,
    license: 'Active',
    historyId: '#1642 • Blocking Pedestrian',
    historyDetail: 'East Ave. Approach • Today, 14:59',
    historyStatus: 'Pending',
  },
]

export const demoDailyViolations = [
  { day: 'Wed', heightPct: 40, count: 18 },
  { day: 'Thu', heightPct: 55, count: 24 },
  { day: 'Fri', heightPct: 35, count: 14 },
  { day: 'Sat', heightPct: 75, count: 32 },
  { day: 'Sun', heightPct: 60, count: 26 },
  { day: 'Mon', heightPct: 88, count: 38 },
  { day: 'Tue', heightPct: 28, count: 12 },
]

export const demoGeneratedReports = [
  { id: 1, name: 'Violations Summary - All Intersections', range: 'Sep 10 - Sep 17', format: 'PDF', date: 'Sep 17, 9:02 AM' },
  { id: 2, name: 'Traffic Volume Report - Commonwealth Ave', range: 'Sep 1 - Sep 17', format: 'PDF', date: 'Sep 17, 8:41 AM' },
  { id: 3, name: 'Emergency Response Log - All Intersections', range: 'Aug 24 - Sep 10', format: 'PDF', date: 'Sep 10, 6:15 PM' },
  { id: 4, name: 'Intersections Performance - Katipunan & Aurora', range: 'Aug 1 - Aug 31', format: 'PDF', date: 'Sep 1, 7:30 AM' },
]

export const demoNotifications = [
  { title: 'New violation for review', detail: 'Quezon Ave. Approach · 2 min ago', path: '/violations', preference: 'queue' },
  { title: 'Signal offline', detail: 'South Avenue · 18 min ago', path: '/traffic-lights', preference: 'sensors' },
]

export const demoCredentials = {
  email: demoViolators[0].email,
}