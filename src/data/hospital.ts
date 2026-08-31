/**
 * Site content.
 *
 * Everything the pages render lives here rather than inline in JSX, so the
 * booking form's department list, the doctors page and the homepage grid can
 * never disagree about what departments exist or who works in them. When this
 * site is wired to the HIS these become API reads with the same shapes.
 */

import type { LucideIcon } from "lucide-react";
import {
  Activity, Baby, Bone, Brain, Ear, Eye, HeartPulse, Microscope,
  Scan, Scissors, Stethoscope, Syringe,
} from "lucide-react";

/* ── Departments ─────────────────────────────────────────── */

export interface Department {
  id: string;
  name: string;
  nameAr: string;
  blurb: string;
  icon: LucideIcon;
  /** Emergency runs around the clock; clinics keep consulting hours. */
  alwaysOpen?: boolean;
}

export const DEPARTMENTS: Department[] = [
  { id: "emergency", name: "Emergency", nameAr: "الطوارئ", icon: Activity, alwaysOpen: true,
    blurb: "Resuscitation, trauma and urgent care, staffed by consultants day and night." },
  { id: "cardiology", name: "Cardiology", nameAr: "القلب", icon: HeartPulse,
    blurb: "Echocardiography, stress testing, angiography and a dedicated cardiac unit." },
  { id: "surgery", name: "General Surgery", nameAr: "الجراحة العامة", icon: Scissors,
    blurb: "Six theatres, laparoscopic as standard, with same-day discharge where it is safe." },
  { id: "maternity", name: "Maternity", nameAr: "الولادة", icon: Baby, alwaysOpen: true,
    blurb: "Antenatal care, delivery suites and a level-two neonatal unit on the same floor." },
  { id: "paediatrics", name: "Paediatrics", nameAr: "الأطفال", icon: Stethoscope,
    blurb: "From newborn checks to adolescent medicine, in rooms built for small people." },
  { id: "orthopaedics", name: "Orthopaedics", nameAr: "العظام", icon: Bone,
    blurb: "Joint replacement, sports injury and fracture clinics with on-site physiotherapy." },
  { id: "neurology", name: "Neurology", nameAr: "المخ والأعصاب", icon: Brain,
    blurb: "Stroke pathway, epilepsy monitoring and headache clinics." },
  { id: "ophthalmology", name: "Ophthalmology", nameAr: "العيون", icon: Eye,
    blurb: "Cataract surgery, retinal imaging and paediatric vision screening." },
  { id: "ent", name: "ENT", nameAr: "الأنف والأذن", icon: Ear,
    blurb: "Hearing assessment, sinus surgery and voice clinics." },
  { id: "imaging", name: "Imaging", nameAr: "الأشعة", icon: Scan,
    blurb: "MRI, CT, ultrasound and mammography, reported within twenty-four hours." },
  { id: "laboratory", name: "Laboratory", nameAr: "المختبر", icon: Microscope, alwaysOpen: true,
    blurb: "Full pathology, haematology and microbiology, with results to your portal." },
  { id: "vaccination", name: "Vaccination", nameAr: "التطعيمات", icon: Syringe,
    blurb: "Childhood schedules, travel vaccines and seasonal influenza clinics." },
];

export const departmentById = (id: string) => DEPARTMENTS.find((d) => d.id === id);

/* ── Doctors ─────────────────────────────────────────────── */

export interface Doctor {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  departmentId: string;
  /** Years in practice — used for the "since" line, not a vanity number. */
  since: number;
  languages: string[];
  focus: string;
  /** Days the clinic runs, as short labels. */
  days: string[];
  /** Deterministic portrait tint so cards differ without needing photography. */
  accent: "brand" | "mint" | "coral";
  initials: string;
}

export const DOCTORS: Doctor[] = [
  { id: "d-hana", name: "Dr. Hana Mansour", nameAr: "د. هناء منصور", title: "Consultant Cardiologist",
    departmentId: "cardiology", since: 2009, languages: ["Arabic", "English", "French"],
    focus: "Heart failure and interventional cardiology", days: ["Sun", "Tue", "Thu"],
    accent: "brand", initials: "HM" },
  { id: "d-karim", name: "Dr. Karim El-Sayed", nameAr: "د. كريم السيد", title: "Consultant Surgeon",
    departmentId: "surgery", since: 2006, languages: ["Arabic", "English"],
    focus: "Laparoscopic and hepatobiliary surgery", days: ["Sat", "Mon", "Wed"],
    accent: "mint", initials: "KS" },
  { id: "d-nour", name: "Dr. Nour Abdelrahman", nameAr: "د. نور عبدالرحمن", title: "Consultant Obstetrician",
    departmentId: "maternity", since: 2011, languages: ["Arabic", "English"],
    focus: "High-risk pregnancy and foetal medicine", days: ["Sun", "Mon", "Wed", "Thu"],
    accent: "coral", initials: "NA" },
  { id: "d-omar", name: "Dr. Omar Farouk", nameAr: "د. عمر فاروق", title: "Consultant Paediatrician",
    departmentId: "paediatrics", since: 2013, languages: ["Arabic", "English", "German"],
    focus: "Neonatology and childhood asthma", days: ["Sat", "Sun", "Tue"],
    accent: "brand", initials: "OF" },
  { id: "d-yasmine", name: "Dr. Yasmine Halim", nameAr: "د. ياسمين حليم", title: "Consultant Neurologist",
    departmentId: "neurology", since: 2010, languages: ["Arabic", "English"],
    focus: "Stroke medicine and epilepsy", days: ["Mon", "Wed"],
    accent: "mint", initials: "YH" },
  { id: "d-tarek", name: "Dr. Tarek Nabil", nameAr: "د. طارق نبيل", title: "Consultant Orthopaedic Surgeon",
    departmentId: "orthopaedics", since: 2005, languages: ["Arabic", "English"],
    focus: "Knee and hip replacement", days: ["Sat", "Tue", "Thu"],
    accent: "coral", initials: "TN" },
  { id: "d-salma", name: "Dr. Salma Rashad", nameAr: "د. سلمى رشاد", title: "Consultant Ophthalmologist",
    departmentId: "ophthalmology", since: 2012, languages: ["Arabic", "English"],
    focus: "Cataract and retinal surgery", days: ["Sun", "Wed"],
    accent: "brand", initials: "SR" },
  { id: "d-adel", name: "Dr. Adel Mostafa", nameAr: "د. عادل مصطفى", title: "Consultant in Emergency Medicine",
    departmentId: "emergency", since: 2008, languages: ["Arabic", "English"],
    focus: "Trauma and critical care", days: ["Rotating"],
    accent: "mint", initials: "AM" },
  { id: "d-mariam", name: "Dr. Mariam Fouad", nameAr: "د. مريم فؤاد", title: "Consultant Radiologist",
    departmentId: "imaging", since: 2014, languages: ["Arabic", "English"],
    focus: "Cross-sectional and breast imaging", days: ["Sat", "Mon", "Thu"],
    accent: "coral", initials: "MF" },
  { id: "d-hossam", name: "Dr. Hossam Zaki", nameAr: "د. حسام زكي", title: "Consultant ENT Surgeon",
    departmentId: "ent", since: 2010, languages: ["Arabic", "English"],
    focus: "Endoscopic sinus surgery", days: ["Sun", "Tue"],
    accent: "brand", initials: "HZ" },
];

export const doctorsForDepartment = (departmentId: string) =>
  DOCTORS.filter((d) => d.departmentId === departmentId);

/* ── Leadership & staff ──────────────────────────────────── */

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  blurb: string;
  initials: string;
  accent: "brand" | "mint" | "coral";
}

export const LEADERSHIP: StaffMember[] = [
  { id: "s-1", name: "Dr. Amal Sherif", role: "Chief Executive", initials: "AS", accent: "brand",
    blurb: "A physician by training, twenty-two years in hospital medicine before taking the executive office." },
  { id: "s-2", name: "Dr. Ihab Guirguis", role: "Medical Director", initials: "IG", accent: "mint",
    blurb: "Leads the consultant body and owns clinical governance across every department." },
  { id: "s-3", name: "Ms. Rania Kamal", role: "Director of Nursing", initials: "RK", accent: "coral",
    blurb: "Built the ward staffing model that keeps a named nurse with each patient through a shift." },
  { id: "s-4", name: "Mr. Sameh Louis", role: "Director of Operations", initials: "SL", accent: "brand",
    blurb: "Responsible for theatres, imaging throughput and the pharmacy supply chain." },
  { id: "s-5", name: "Dr. Laila Zaki", role: "Head of Quality & Safety", initials: "LZ", accent: "mint",
    blurb: "Runs incident review and the accreditation programme." },
  { id: "s-6", name: "Mr. Youssef Adly", role: "Chief Information Officer", initials: "YA", accent: "coral",
    blurb: "Owns the hospital information system, the patient portal and clinical data protection." },
];

/* ── Proof points ────────────────────────────────────────── */

export const STATS = [
  { value: 24, suffix: "/7", label: "Emergency & pharmacy", hint: "Never closed, not once." },
  { value: 180, suffix: "+", label: "Beds across six floors", hint: "Including 24 critical care." },
  { value: 42, suffix: "", label: "Consultants on staff", hint: "Across twelve specialties." },
  { value: 19, suffix: " min", label: "Median wait in Emergency", hint: "Measured, not estimated." },
];

/* ── How a visit works ───────────────────────────────────── */

export const JOURNEY = [
  { step: "01", title: "Book in a minute", text: "Pick a department, a consultant and a slot. No phone queue, no callback." },
  { step: "02", title: "Arrive to a room, not a corridor", text: "Check in at the desk or on your phone. Your notes are already open." },
  { step: "03", title: "See the same consultant", text: "Follow-ups stay with the doctor who saw you first, unless you ask otherwise." },
  { step: "04", title: "Everything in your portal", text: "Results, prescriptions and letters land in one place before you get home." },
];

/* ── Voices ──────────────────────────────────────────────── */

export const TESTIMONIALS = [
  { quote: "I booked at eleven at night and was seen at nine the next morning. The consultant already had my old scans open.",
    name: "Mona A.", context: "Cardiology outpatient" },
  { quote: "They explained the operation twice — once to me, once to my mother, in the way each of us needed to hear it.",
    name: "Tamer H.", context: "General surgery" },
  { quote: "The paediatric floor does not feel like a hospital. My daughter asked when we were coming back.",
    name: "Dina S.", context: "Paediatrics" },
];
