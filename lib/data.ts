import type { Project, Clients } from './types';
import { generateId } from './helpers';

export const DEFAULT_CLIENTS: Clients = {
  OBM: ['Dave Asprey', 'FastFit', 'VYVE', 'Dr. Karan', 'Ancestral Supplements'],
  CFM: ['Matthew Volkwyn', 'Adsurdity', 'Find Me Mexico', 'NGT-Academy', 'Temporary Projects'],
};

export const SEED_PROJECTS: Project[] = [
  // ---- OBM: Dave Asprey ----
  { id: generateId(), ws: 'OBM', cl: 'Dave Asprey', title: 'Biohacking Your Brain for Peak Performance', editor: 'Alex', status: 'Done', priority: 'HIGH', d1: '2026-04-28', d2: '2026-05-05', d3: '2026-05-10', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Dave Asprey', title: 'The Ultimate Anti-Aging Stack Explained', editor: 'Alex', status: 'Full- Running', priority: 'MEDIUM', d1: '2026-05-05', d2: '2026-05-15', d3: '', other: 'B-roll needed' },
  { id: generateId(), ws: 'OBM', cl: 'Dave Asprey', title: 'Cold Therapy & Mitochondrial Function', editor: 'Sam', status: 'Revision', priority: 'MEDIUM', d1: '2026-05-08', d2: '2026-05-18', d3: '', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Dave Asprey', title: 'Sleep Optimization: What Actually Works', editor: 'Alex', status: 'Waiting', priority: '', d1: '2026-05-12', d2: '2026-05-22', d3: '', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Dave Asprey', title: 'Red Light Therapy Deep Dive', editor: 'Sam', status: 'Pending', priority: 'LOW', d1: '2026-05-20', d2: '2026-06-01', d3: '', other: '' },
  // ---- OBM: FastFit ----
  { id: generateId(), ws: 'OBM', cl: 'FastFit', title: '10-Minute Morning Workout Routine', editor: 'Jordan', status: 'Done', priority: '', d1: '2026-04-20', d2: '2026-04-28', d3: '2026-05-02', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'FastFit', title: 'HIIT vs Steady State Cardio: The Truth', editor: 'Jordan', status: 'Full- Running', priority: 'HIGH', d1: '2026-05-06', d2: '2026-05-16', d3: '', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'FastFit', title: 'Meal Prep for Busy Athletes', editor: 'Sam', status: 'Pending', priority: 'MEDIUM', d1: '2026-05-18', d2: '2026-05-28', d3: '', other: '' },
  // ---- OBM: VYVE ----
  { id: generateId(), ws: 'OBM', cl: 'VYVE', title: 'Brand Story — How VYVE Was Born', editor: 'Alex', status: 'Done', priority: '', d1: '2026-04-15', d2: '2026-04-25', d3: '2026-04-30', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'VYVE', title: 'Product Launch: VYVE Summer Collection', editor: 'Jordan', status: 'Revision', priority: 'HIGH', d1: '2026-05-10', d2: '2026-05-20', d3: '', other: 'Colour grade revision' },
  // ---- OBM: Dr. Karan ----
  { id: generateId(), ws: 'OBM', cl: 'Dr. Karan', title: 'Why You\'re Always Tired (The Real Reason)', editor: 'Sam', status: 'Done', priority: '', d1: '2026-04-22', d2: '2026-04-30', d3: '2026-05-04', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Dr. Karan', title: 'Gut Health & Your Mental State', editor: 'Sam', status: 'Full- Running', priority: 'MEDIUM', d1: '2026-05-07', d2: '2026-05-17', d3: '', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Dr. Karan', title: 'Is Your Posture Ruining Your Health?', editor: 'Alex', status: 'Waiting', priority: '', d1: '2026-05-14', d2: '2026-05-24', d3: '', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Dr. Karan', title: 'Stress Hormones & How to Reset', editor: 'Jordan', status: 'Pending', priority: 'LOW', d1: '2026-05-22', d2: '2026-06-02', d3: '', other: '' },
  // ---- OBM: Ancestral Supplements ----
  { id: generateId(), ws: 'OBM', cl: 'Ancestral Supplements', title: 'Liver King Explains Ancestral Living', editor: 'Alex', status: 'Done', priority: 'HIGH', d1: '2026-04-18', d2: '2026-04-26', d3: '2026-05-01', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Ancestral Supplements', title: 'Organ Meats: The Ultimate Superfood', editor: 'Sam', status: 'Revision', priority: 'MEDIUM', d1: '2026-05-09', d2: '2026-05-19', d3: '', other: '' },
  { id: generateId(), ws: 'OBM', cl: 'Ancestral Supplements', title: 'Bone Broth Protocol for Gut Healing', editor: 'Jordan', status: 'Pending', priority: '', d1: '2026-05-21', d2: '2026-06-03', d3: '', other: '' },

  // ---- CFM: Matthew Volkwyn ----
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Copywriting Secrets That Convert', editor: 'Priya', status: 'Done', priority: 'HIGH', d1: '2026-04-14', d2: '2026-04-22', d3: '2026-04-27', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'How to Write a Million-Dollar Headline', editor: 'Priya', status: 'Done', priority: '', d1: '2026-04-16', d2: '2026-04-24', d3: '2026-04-29', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Brand Voice: Standing Out in a Noisy Market', editor: 'Chris', status: 'Done', priority: 'MEDIUM', d1: '2026-04-20', d2: '2026-04-28', d3: '2026-05-03', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Email Marketing That Actually Works', editor: 'Priya', status: 'Full- Running', priority: 'HIGH', d1: '2026-05-02', d2: '2026-05-12', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'The Psychology of Persuasion in Ads', editor: 'Chris', status: 'Full- Running', priority: 'MEDIUM', d1: '2026-05-05', d2: '2026-05-15', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Social Proof: Building Trust at Scale', editor: 'Priya', status: 'Revision', priority: '', d1: '2026-05-07', d2: '2026-05-17', d3: '', other: 'Client wants shorter intro' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Landing Page Anatomy for High Conversions', editor: 'Chris', status: 'Revision', priority: 'HIGH', d1: '2026-05-08', d2: '2026-05-18', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Interview: How He Built a 7-Figure Brand', editor: 'Priya', status: 'Waiting', priority: 'MEDIUM', d1: '2026-05-11', d2: '2026-05-21', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'The Offer Stack Framework Explained', editor: 'Chris', status: 'Waiting', priority: '', d1: '2026-05-13', d2: '2026-05-23', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Content That Builds Authority Fast', editor: 'Priya', status: 'Pending', priority: 'LOW', d1: '2026-05-19', d2: '2026-05-29', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Story Selling: Why Stories Make Sales', editor: 'Chris', status: 'Pending', priority: '', d1: '2026-05-20', d2: '2026-06-01', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Video Sales Letters: The Complete Guide', editor: 'Priya', status: 'Pending', priority: 'MEDIUM', d1: '2026-05-22', d2: '2026-06-03', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Retargeting Ads That Win Back Customers', editor: 'Chris', status: 'Done', priority: '', d1: '2026-04-25', d2: '2026-05-03', d3: '2026-05-08', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Building a Content Machine for Founders', editor: 'Priya', status: 'Full- Running', priority: 'HIGH', d1: '2026-05-09', d2: '2026-05-19', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'The Art of the Follow-Up Email Sequence', editor: 'Chris', status: 'Revision', priority: 'MEDIUM', d1: '2026-05-10', d2: '2026-05-20', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Pricing Strategy: Charge What You\'re Worth', editor: 'Priya', status: 'Waiting', priority: 'LOW', d1: '2026-05-14', d2: '2026-05-24', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'Facebook Ads in 2026: What\'s Still Working', editor: 'Chris', status: 'Done', priority: '', d1: '2026-04-28', d2: '2026-05-06', d3: '2026-05-11', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Matthew Volkwyn', title: 'The Ultimate Brand Audit Walkthrough', editor: 'Priya', status: 'Pending', priority: '', d1: '2026-05-24', d2: '2026-06-05', d3: '', other: '' },
  // ---- CFM: Adsurdity ----
  { id: generateId(), ws: 'CFM', cl: 'Adsurdity', title: 'Ad Creatives That Stop the Scroll', editor: 'Chris', status: 'Done', priority: 'HIGH', d1: '2026-04-23', d2: '2026-05-01', d3: '2026-05-06', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Adsurdity', title: 'Why Humor Works in Advertising', editor: 'Sam', status: 'Revision', priority: 'MEDIUM', d1: '2026-05-11', d2: '2026-05-21', d3: '', other: '' },
  // ---- CFM: Find Me Mexico ----
  { id: generateId(), ws: 'CFM', cl: 'Find Me Mexico', title: 'Mexico City Travel Guide — May V1', editor: 'Jordan', status: 'Done', priority: '', d1: '2026-04-29', d2: '2026-05-07', d3: '2026-05-12', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Find Me Mexico', title: 'Oaxaca Hidden Gems — May V2', editor: 'Jordan', status: 'Done', priority: '', d1: '2026-05-01', d2: '2026-05-09', d3: '2026-05-14', other: '' },
  // ---- CFM: NGT-Academy ----
  { id: generateId(), ws: 'CFM', cl: 'NGT-Academy', title: 'Ethical Hacking for Beginners — Module 1', editor: 'Alex', status: 'Full- Running', priority: 'HIGH', d1: '2026-05-03', d2: '2026-05-13', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'NGT-Academy', title: 'Network Security Fundamentals', editor: 'Alex', status: 'Full- Running', priority: 'MEDIUM', d1: '2026-05-06', d2: '2026-05-16', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'NGT-Academy', title: 'Penetration Testing Toolkit Overview', editor: 'Sam', status: 'Revision', priority: 'MEDIUM', d1: '2026-05-10', d2: '2026-05-20', d3: '', other: 'Add screen recordings' },
  { id: generateId(), ws: 'CFM', cl: 'NGT-Academy', title: 'Social Engineering: Human Vulnerabilities', editor: 'Alex', status: 'Pending', priority: 'LOW', d1: '2026-05-18', d2: '2026-05-28', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'NGT-Academy', title: 'CTF Walkthrough: Beginner Challenges', editor: 'Sam', status: 'Pending', priority: '', d1: '2026-05-23', d2: '2026-06-04', d3: '', other: '' },
  // ---- CFM: Temporary Projects ----
  { id: generateId(), ws: 'CFM', cl: 'Temporary Projects', title: 'Intro Animation Package', editor: 'Kishan', status: 'Kishan', priority: '', d1: '2026-05-12', d2: '2026-05-19', d3: '', other: '' },
  { id: generateId(), ws: 'CFM', cl: 'Temporary Projects', title: 'Lower Thirds & Motion Graphics Set', editor: 'Kishan', status: 'Kishan', priority: '', d1: '2026-05-15', d2: '2026-05-22', d3: '', other: '' },
];
