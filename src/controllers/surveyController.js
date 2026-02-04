import Survey from '../models/Survey.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

const defaultSurveys = [
  {
    title: 'Survey 1: Program Feedback',
    description: 'Help us understand your program experience.',
    version: '1.0',
    isActive: true,
    questions: [
      {
        prompt: "What is your coach(s) name?",
        type: 'text',
        required: true,
        order: 1,
        image: '/assets/3d-portrait-people-removebg-preview.png',
        placeholder: 'Coach name'
      },
      {
        prompt: "What is today's date?",
        type: 'date',
        required: true,
        order: 2,
        image: '/assets/whatisthedate.jpg'
      },
      {
        prompt: 'What is your full name?',
        type: 'text',
        required: true,
        order: 3,
        image: '/assets/whatisyourname.jpg',
        placeholder: 'Full name'
      },
      {
        prompt: 'Site?',
        type: 'select',
        required: true,
        order: 4,
        options: [
          { label: 'PMTC -Making Good Choices', value: 'PMTC -Making Good Choices' },
          { label: 'Jake Gaither Community Center -Making good choices', value: 'Jake Gaither Community Center -Making good choices' },
          { label: 'Jack McLean CC - Making Good Choices', value: 'Jack McLean CC - Making Good Choices' },
          { label: 'Nims Middle School - Dealing with my feelings', value: 'Nims Middle School - Dealing with my feelings' },
          { label: 'Lawrence Gregory / Dade Street', value: 'Lawrence Gregory / Dade Street' },
          { label: 'Laverne Pain', value: 'Laverne Pain' },
          { label: 'Renaissance Academy', value: 'Renaissance Academy' },
          { label: 'Springwood/OLL', value: 'Springwood/OLL' },
          { label: 'FAMU DRS', value: 'FAMU DRS' },
          { label: 'Creative Mind Solutions, Inc', value: 'Creative Mind Solutions, Inc' },
          { label: 'Ruediger Elementary School', value: 'Ruediger Elementary School' },
          { label: 'Changing Lives 4 Ever', value: 'Changing Lives 4 Ever' },
          { label: 'Oxford Learning Academy', value: 'Oxford Learning Academy' },
          { label: 'SheAcademy', value: 'SheAcademy' }
        ]
      },
      {
        prompt: 'What grade are you in?',
        type: 'single-choice',
        required: true,
        order: 5,
        options: [
          { label: 'PreK', value: 'PreK', image: '/assets/prek.jpg' },
          { label: 'Kindergarten', value: 'Kindergarten', image: '/assets/kindergarten.jpg' },
          { label: '1st grade', value: '1st grade', image: '/assets/1stgrade.jpg' },
          { label: '2nd grade', value: '2nd grade', image: '/assets/2ndgrade.jpg' },
          { label: '3rd grade', value: '3rd grade', image: '/assets/3rdgrade.jpg' },
          { label: '4th grade', value: '4th grade', image: '/assets/4thgrade.jpg' },
          { label: '5th grade', value: '5th grade', image: '/assets/5thgrade.png' },
          { label: '6th grade', value: '6th grade', image: '/assets/6thgrade.png' },
          { label: 'Middle school', value: 'Middle school' },
          { label: 'High school', value: 'High school' },
          { label: 'Other', value: 'Other' }
        ]
      },
      {
        prompt: "During the summer, what areas do you feel like you've been helped with?",
        type: 'multi-choice',
        required: true,
        order: 6,
        allowMultiple: true,
        options: [
          { label: 'Dealing with my feelings', value: 'Dealing with my feelings', image: '/assets/dealingwithmyfeelings.png' },
          { label: 'Handling my worries', value: 'Handling my worries', image: '/assets/handlingmyworries.png' },
          { label: 'Making and Keeping friends', value: 'Making and Keeping friends', image: '/assets/makingandkeepingfriends.png' },
          { label: 'Making good choices', value: 'Making good choices' },
          { label: 'Solving problems', value: 'Solving problems' },
          { label: 'My family life at home', value: 'My family life at home', image: '/assets/myfamilylifeathome.png' }
        ]
      },
      {
        prompt: 'I believe the program addressed my needs?',
        type: 'single-choice',
        required: true,
        order: 7,
        options: [
          { label: 'Yes', value: 'Yes', image: '/assets/thumbsup.jpg' },
          { label: 'No', value: 'No', image: '/assets/thumbsdown.jpg' }
        ]
      },
      {
        prompt: 'I feel the program has benefitted me?',
        type: 'single-choice',
        required: true,
        order: 8,
        options: [
          { label: 'Yes', value: 'Yes', image: '/assets/thumbsup.jpg' },
          { label: 'No', value: 'No', image: '/assets/thumbsdown.jpg' }
        ]
      },
      {
        prompt: 'I know how to manage my feelings?',
        type: 'single-choice',
        required: true,
        order: 9,
        options: [
          { label: 'Yes', value: 'Yes', image: '/assets/thumbsup.jpg' },
          { label: 'No', value: 'No', image: '/assets/thumbsdown.jpg' }
        ]
      }
    ]
  },
  {
    title: 'Survey 2: Youth Experience Check-in',
    description: 'Share how your Wellness Navigator can help you.',
    version: '1.0',
    isActive: true,
    questions: [
      {
        prompt: "What is your coach(s) name?",
        type: 'text',
        required: true,
        order: 1,
        image: '/assets/3d-portrait-people-removebg-preview.png',
        placeholder: 'Coach name'
      },
      {
        prompt: "What is today's date?",
        type: 'date',
        required: true,
        order: 2,
        image: '/assets/whatstodaysdatesurvey2.jpg'
      },
      {
        prompt: 'What is your full name?',
        type: 'text',
        required: true,
        order: 3,
        image: '/assets/whatsyournamesurvey2.jpg',
        placeholder: 'Full name'
      },
      {
        prompt: 'What grade are you in?',
        type: 'single-choice',
        required: true,
        order: 4,
        options: [
          { label: 'K/1st', value: 'K/1st', image: '/assets/K1stsurvey2.jpg' },
          { label: '2nd', value: '2nd', image: '/assets/kindergarten.jpg' },
          { label: '3rd', value: '3rd', image: '/assets/3rdgradesurvey2.jpg' },
          { label: '4th', value: '4th', image: '/assets/4thgradesurvey2.jpg' },
          { label: '5th', value: '5th', image: '/assets/5thgradesurvey2.png' },
          { label: '6th', value: '6th', image: '/assets/6thgradesurvey2.png' },
          { label: '7th', value: '7th', image: '/assets/7thgradesurvey2.png' },
          { label: '8th', value: '8th', image: '/assets/8thgradesurvey2.png' },
          { label: '9th', value: '9th', image: '/assets/9thgradesurvey2.png' },
          { label: '10th', value: '10th', image: '/assets/10thgradesurvey2.png' },
          { label: '11th', value: '11th', image: '/assets/11thgradesurvey2.png' },
          { label: '12th', value: '12th', image: '/assets/12thgradesurvey2.png' }
        ]
      },
      {
        prompt: 'How can your Wellness Navigator help you? Check the boxes below.',
        type: 'multi-choice',
        required: true,
        order: 5,
        allowMultiple: true,
        options: [
          { label: 'Dealing with my feelings', value: 'Dealing with my feelings', image: '/assets/dealingwithmyfeelingssurvey2.png' },
          { label: 'Handling my worries', value: 'Handling my worries', image: '/assets/handlingmyworriessurvey2.png' },
          { label: 'Making and Keeping friends', value: 'Making and Keeping friends', image: '/assets/makingandkeepingfriendssurvey2.png' },
          { label: 'Making good choices', value: 'Making good choices', image: '/assets/makinggoodchoicessurvey2.png' },
          { label: 'Solving problems', value: 'Solving problems', image: '/assets/solvingproblemssurvey2.png' },
          { label: 'My family life at home', value: 'My family life at home', image: '/assets/myfamilylifeathomesurvey2.png' },
          { label: 'Others', value: 'Others' }
        ]
      },
      {
        prompt: 'How else can your Wellness Navigator help you?',
        type: 'text',
        required: false,
        order: 6,
        image: '/assets/howcanwehelpyousurvey2.png',
        placeholder: 'Share your thoughts'
      },
      {
        prompt: 'Site Location',
        type: 'select',
        required: true,
        order: 7,
        options: [
          { label: 'Jack McLean', value: 'Jack McLean' },
          { label: 'Jake Gaither', value: 'Jake Gaither' },
          { label: 'Walker Ford', value: 'Walker Ford' },
          { label: 'Palmer Munroe Teen Center', value: 'Palmer Munroe Teen Center' },
          { label: 'Nims Middle School', value: 'Nims Middle School' },
          { label: 'Changing Lives', value: 'Changing Lives' },
          { label: 'Creative Minds', value: 'Creative Minds' },
          { label: 'Oxford Learning', value: 'Oxford Learning' },
          { label: 'OLL', value: 'OLL' },
          { label: 'Dade Street', value: 'Dade Street' },
          { label: 'Lavern Payne', value: 'Lavern Payne' },
          { label: 'Other', value: 'Other' }
        ]
      },
      {
        prompt: 'Thank you for completing the survey!',
        type: 'info',
        required: false,
        order: 8,
        image: '/assets/thankyoupostsurvey2.jpg'
      }
    ]
  }
];

const ensureDefaultSurveys = async () => {
  await Promise.all(
    defaultSurveys.map(async (survey) => {
      await Survey.findOneAndUpdate(
        { title: survey.title },
        { $set: survey },
        { new: true, upsert: true }
      );
    })
  );
};

export const getSurveys = async (req, res, next) => {
  try {
    await ensureDefaultSurveys();
    const surveys = await Survey.find({ isActive: true }).sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Surveys retrieved successfully', surveys);
  } catch (error) {
    next(error);
  }
};

export const getSurveyById = async (req, res, next) => {
  try {
    await ensureDefaultSurveys();
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return sendError(res, 404, 'Survey not found');
    }
    sendSuccess(res, 200, 'Survey retrieved successfully', survey);
  } catch (error) {
    next(error);
  }
};
