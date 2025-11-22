export type Language = 'en' | 'am';

export interface Translations {
  // Common
  common: {
    back: string;
    cancel: string;
    submit: string;
    create: string;
    share: string;
    copied: string;
    loading: string;
    success: string;
    error: string;
    optional: string;
    required: string;
  };
  
  // Home page
  home: {
    title: string;
    subtitle: string;
    description: string;
    createMeeting: string;
    createMeetingDesc: string;
    getStarted: string;
    features: string;
    howItWorks: string;
    ethiopianCalendar: string;
    ethiopianCalendarDesc: string;
    teamCollaboration: string;
    teamCollaborationDesc: string;
    simpleFast: string;
    simpleFastDesc: string;
    step1: string;
    step1Desc: string;
    step2: string;
    step2Desc: string;
    step3: string;
    step3Desc: string;
    step4: string;
    step4Desc: string;
    footer: string;
    madeBy: string;
  };
  
  // Create meeting page
  create: {
    title: string;
    subtitle: string;
    meetingTitle: string;
    yourName: string;
    description: string;
    dateRange: string;
    timeRange: string;
    startTime: string;
    endTime: string;
    meetingDuration: string;
    meetingDurationDesc: string;
    calendarSystem: string;
    ethiopian: string;
    gregorian: string;
    both: string;
    startDateEth: string;
    startDateGreg: string;
    endDateEth: string;
    endDateGreg: string;
    startDate: string;
    endDate: string;
  };
  
  // Meeting page
  meeting: {
    markAvailability: string;
    markAvailabilityDesc: string;
    yourName: string;
    submitAvailability: string;
    instructions: string;
    instructionsText: string;
    yourSelection: string;
    mostAvailable: string;
    noResponses: string;
    availabilityGrid: string;
    availabilityGridDesc: string;
    somewhatAvailable: string;
    participants: string;
    slotsSelected: string;
    tapToSelect: string;
    selected: string;
    meetingNotFound: string;
    goHome: string;
    successMessage: string;
    successDescription: string;
  };
  
  // Duration options
  duration: {
    minutes30: string;
    hour1: string;
    hours1_5: string;
    hours2: string;
    hours2_5: string;
    hours3: string;
    hours4: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      back: 'Back',
      cancel: 'Cancel',
      submit: 'Submit',
      create: 'Create',
      share: 'Share',
      copied: 'Copied',
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error',
      optional: '(Optional)',
      required: '*',
    },
    home: {
      title: 'Your Team\'s Meeting Place',
      subtitle: 'Schedule meetings using the Ethiopian calendar',
      description: 'Megenagna brings Ethiopian teams together. Coordinate schedules with authentic Ethiopian calendar support and find times that work for everyone.',
      createMeeting: 'Create New Meeting',
      createMeetingDesc: 'Set up a new meeting poll. Choose dates and times, then share the link with your team to collect their availability.',
      getStarted: 'Get Started',
      features: 'Features',
      howItWorks: 'How It Works',
      ethiopianCalendar: 'Ethiopian Calendar',
      ethiopianCalendarDesc: 'Native support for the Ethiopian calendar with Ge\'ez numerals and month names',
      teamCollaboration: 'Team Collaboration',
      teamCollaborationDesc: 'Everyone marks their availability and see overlapping free times at a glance',
      simpleFast: 'Simple & Fast',
      simpleFastDesc: 'Intuitive drag-and-drop interface makes scheduling quick and effortless',
      step1: 'Create',
      step1Desc: 'Set up your meeting with dates and times',
      step2: 'Share',
      step2Desc: 'Send the link to your team members',
      step3: 'Mark',
      step3Desc: 'Everyone marks when they\'re available',
      step4: 'Decide',
      step4Desc: 'See the best times for everyone',
      footer: 'For Great Meetings and Collaboration!',
      madeBy: 'Made by Alpha prompting Cursor',
    },
    create: {
      title: 'Create Meeting',
      subtitle: 'Set up a meeting and share with your team',
      meetingTitle: 'Meeting Title',
      yourName: 'Your Name',
      description: 'Description',
      dateRange: 'Date Range',
      timeRange: 'Time Range',
      startTime: 'Start Time',
      endTime: 'End Time',
      meetingDuration: 'Meeting Duration',
      meetingDurationDesc: 'Each time slot will be',
      calendarSystem: 'Calendar System',
      ethiopian: 'Ethiopian',
      gregorian: 'Gregorian',
      both: 'Both',
      startDateEth: 'Start Date (Ethiopian)',
      startDateGreg: 'Start Date (Gregorian)',
      endDateEth: 'End Date (Ethiopian)',
      endDateGreg: 'End Date (Gregorian)',
      startDate: 'Start Date',
      endDate: 'End Date',
    },
    meeting: {
      markAvailability: 'Mark Your Availability',
      markAvailabilityDesc: 'Select the times when you\'re free to meet',
      yourName: 'Your Name',
      submitAvailability: 'Submit',
      instructions: 'How to select:',
      instructionsText: 'Click on time slots in the calendar below to mark your availability. Each selection represents a',
      yourSelection: 'Your selection',
      mostAvailable: 'Most available',
      noResponses: 'No responses',
      availabilityGrid: 'Availability Grid',
      availabilityGridDesc: 'Heat map showing team availability',
      somewhatAvailable: 'Somewhat available',
      participants: 'Participants',
      slotsSelected: 'slots selected',
      tapToSelect: 'Tap to select',
      selected: 'selected',
      meetingNotFound: 'Meeting not found',
      goHome: 'Go Home',
      successMessage: 'Success!',
      successDescription: 'Your availability has been saved. Share this link with others to collect their availability.',
    },
    duration: {
      minutes30: '30 minutes',
      hour1: '1 hour',
      hours1_5: '1.5 hours',
      hours2: '2 hours',
      hours2_5: '2.5 hours',
      hours3: '3 hours',
      hours4: '4 hours',
    },
  },
  am: {
    common: {
      back: 'ተመለስ',
      cancel: 'ሰርዝ',
      submit: 'አስገባ',
      create: 'ፍጠር',
      share: 'አጋራ',
      copied: 'ተቀድቷል',
      loading: 'በመጫን ላይ...',
      success: 'ተሳክቷል!',
      error: 'ስህተት',
      optional: '(አማራጭ)',
      required: '*',
    },
    home: {
      title: 'የቡድንዎ መሰባሰቢያ',
      subtitle: 'በኢትዮጵያ አቆጣጠር ስብሰባዎችን ያቅዱ',
      description: 'መገናኛ ኢትዮጵያዊ ቡድኖችን ያቀራርባል። ከእውነተኛ የኢትዮጵያ አቆጣጠር ድጋፍ ጋር የጊዜ ሰሌዳዎችን ያቅዱ እና ለሁሉም የሚሠራ ጊዜዎችን ያግኙ።',
      createMeeting: 'አዲስ ስብሰባ ፍጠር',
      createMeetingDesc: 'አዲስ የስብሰባ መርሐግብር ያዘጋጁ። ቀናትን እና ጊዜዎችን ይምረጡ፣ ከዚያም አገናኙን ለተሳታፊዎች በማጋራት ምርጫቸውን ይቀበሉ።',
      getStarted: 'ጀምር',
      features: 'አገልግሎቶች',
      howItWorks: 'እንዴት ይሠራል',
      ethiopianCalendar: 'የኢትዮጵያ አቆጣጠር',
      ethiopianCalendarDesc: 'ከግዕዝ ቁጥሮች እና የወራት ስሞች ጋር ለኢትዮጵያ አቆጣጠር የተፈጥሮ ድጋፍ',
      teamCollaboration: 'የቡድን ትብብር',
      teamCollaborationDesc: 'ሁሉም የሚመቻቸውን ጊዜ ይመርጣሉ፤ ለሁሉም የሚስማማው ሰዓትም ወዲያውኑ ይታያል',
      simpleFast: 'ቀላል እና ፈጣን',
      simpleFastDesc: 'ለመጠቀም ቀላል የሆነው ገጽታ ስብሰባ ማቀድን ፈጣን እና ቀልጣፋ ያደርገዋል',
      step1: 'ፍጠር',
      step1Desc: 'ቀናትን እና ጊዜዎችን በመጠቀም ስብሰባዎን ያዘጋጁ',
      step2: 'አጋራ',
      step2Desc: 'አገናኙን ለቡድን አባላትዎ ይላኩ',
      step3: 'ምረጥ',
      step3Desc: 'ሁሉም የሚመቻቸውን ጊዜ ይመርጣሉ',
      step4: 'ወሰን',
      step4Desc: 'ለሁሉም የሚሠራውን ምርጥ ጊዜ ይመልከቱ',
      footer: 'ለስኬታማ ስብሰባዎች እና ትብብር!',
      madeBy: 'በአልፋ እና በCursor የተሰራ',
    },
    create: {
      title: 'ስብሰባ ፍጠር',
      subtitle: 'ስብሰባ ያዘጋጁ እና ከቡድንዎ ጋር ያጋሩ',
      meetingTitle: 'የስብሰባ ርዕስ',
      yourName: 'ስምዎ',
      description: 'መግለጫ',
      dateRange: 'ቀናት',
      timeRange: 'ሰዓት',
      startTime: 'መጀመሪያ ሰዓት',
      endTime: 'መጨረሻ ሰዓት',
      meetingDuration: 'የስብሰባው ርዝመት',
      meetingDurationDesc: 'እያንዳንዱ የስብሰባ ጊዜ',
      calendarSystem: 'የቀን አቆጣጠር',
      ethiopian: 'ኢትዮጵያ',
      gregorian: 'ፈረንጆች',
      both: 'ሁለቱም',
      startDateEth: 'መጀመሪያ ቀን (ኢትዮጵያ)',
      startDateGreg: 'መጀመሪያ ቀን (ፈረንጆች)',
      endDateEth: 'መጨረሻ ቀን (ኢትዮጵያ)',
      endDateGreg: 'መጨረሻ ቀን (ፈረንጆች)',
      startDate: 'መጀመሪያ ቀን',
      endDate: 'መጨረሻ ቀን',
    },
    meeting: {
      markAvailability: 'የሚመችዎትን ጊዜ ይምረጡ',
      markAvailabilityDesc: 'ለስብሰባው የሚሆኑበትን ጊዜዎች ላይ ምልክት ያድርጉ',
      yourName: 'ስምዎ',
      submitAvailability: 'አስገባ',
      instructions: 'አጠቃቀም:',
      instructionsText: 'የሚመችዎትን ጊዜ ለመምረጥ ከታች ባለው ካሌንዳር ላይ የጊዜ ሰሌዳዎቹን ይጫኑ። እያንዳንዱ ምርጫ',
      yourSelection: 'የእርስዎ ምርጫ',
      mostAvailable: 'ብዙ ሰው የመረጠው',
      noResponses: 'ያልተመረጠ',
      availabilityGrid: 'የተሳታፊዎች ምርጫ',
      availabilityGridDesc: 'የቡድኑን ምርጫ የሚያሳይ ሰንጠረዥ',
      somewhatAvailable: 'ጥቂት ሰው የመረጠው',
      participants: 'ተሳታፊዎች',
      slotsSelected: 'ጊዜዎች ተመርጠዋል',
      tapToSelect: 'ለመምረጥ ይንኩ',
      selected: 'ተመርጧል',
      meetingNotFound: 'ስብሰባው አልተገኘም',
      goHome: 'ወደ መነሻ ሂድ',
      successMessage: 'ተሳክቷል!',
      successDescription: 'ምርጫዎ ተቀምጧል። የሌሎችን ተሳታፊዎች ምርጫ ለመቀበል ይህንን አገናኝ ያጋሩ።',
    },
    duration: {
      minutes30: '30 ደቂቃ',
      hour1: '1 ሰዓት',
      hours1_5: '1 ከ 30',
      hours2: '2 ሰዓት',
      hours2_5: '2 ከ 30',
      hours3: '3 ሰዓት',
      hours4: '4 ሰዓት',
    },
  },
};

