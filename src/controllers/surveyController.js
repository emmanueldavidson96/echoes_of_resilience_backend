import Survey from '../models/Survey.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

const defaultSurveys = [
  {
    title: 'Survey 1: Summer Program Feedback',
    description: 'Help us understand your summer experience.',
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
    description: 'Tell us how you are feeling about the program.',
    version: '1.0',
    isActive: true,
    questions: [
      {
        prompt: 'What is one thing you enjoyed most?',
        type: 'text',
        required: true,
        order: 1,
        placeholder: 'Share your thoughts'
      }
    ]
  }
];

const seedSurveysIfEmpty = async () => {
  const count = await Survey.countDocuments();
  if (count === 0) {
    await Survey.insertMany(defaultSurveys);
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    await seedSurveysIfEmpty();
    const surveys = await Survey.find({ isActive: true }).sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Surveys retrieved successfully', surveys);
  } catch (error) {
    next(error);
  }
};

export const getSurveyById = async (req, res, next) => {
  try {
    await seedSurveysIfEmpty();
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
