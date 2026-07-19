
import { QuestionSet } from "../types/LogicPuzzleTypes";

// Initial question sets data
export const questionSets: QuestionSet[] = [
  {
    id: 1,
    title: "Basic Logic",
    questions: [
      {
        id: 1,
        text: "In a family of 6 people, each person shakes hands exactly once with everyone else. How many handshakes occurred in total?",
        options: ["6", "12", "15", "30"],
        correctAnswer: "15",
        hint: "Think about combinations: for n people, the number of handshakes is n(n-1)/2",
        answered: false,
        selectedAnswer: null
      },
      {
        id: 2,
        text: "If you have 5 red socks and 4 blue socks in a drawer, how many socks do you need to pull out to guarantee you have a matching pair?",
        options: ["2", "3", "5", "6"],
        correctAnswer: "3",
        hint: "In the worst case, you could pull one of each color initially",
        answered: false,
        selectedAnswer: null
      },
      {
        id: 3,
        text: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
        options: ["$0.05", "$0.10", "$0.15", "$1.00"],
        correctAnswer: "$0.05",
        hint: "If the ball costs x dollars: ball + bat = x + (x + 1.00) = 1.10",
        answered: false,
        selectedAnswer: null
      }
    ]
  },
  {
    id: 2,
    title: "Intermediate Logic",
    questions: [
      {
        id: 1,
        text: "Four people need to cross a rickety bridge at night. They have one torch between them and the bridge is only strong enough to support two people at a time. Person A takes 1 minute to cross, B takes 2 minutes, C takes 5 minutes, and D takes 10 minutes. When two people cross, they must move at the slower person's pace. What is the minimum time needed for all four to cross?",
        options: ["14 minutes", "17 minutes", "19 minutes", "21 minutes"],
        correctAnswer: "17 minutes",
        hint: "Consider who should accompany the slowest person to minimize time",
        answered: false,
        selectedAnswer: null
      },
      {
        id: 2,
        text: "Three light bulbs are in a room with three switches outside. Each switch controls one light. If you can only enter the room once, how can you determine which switch controls which bulb?",
        options: ["It's impossible", "Turn on two, wait, then one", "Turn one on, wait, then turn it off and another on", "Turn all three on at once"],
        correctAnswer: "Turn one on, wait, then turn it off and another on",
        hint: "Think about what property besides light a bulb might have",
        answered: false,
        selectedAnswer: null
      },
      {
        id: 3,
        text: "What comes next in the pattern? 1, 11, 21, 1211, 111221, _____",
        options: ["12211", "312211", "122221", "112213"],
        correctAnswer: "312211",
        hint: "Try reading each number aloud, describing what you see",
        answered: false,
        selectedAnswer: null
      }
    ]
  },
  {
    id: 3,
    title: "Advanced Logic",
    questions: [
      {
        id: 1,
        text: "In a game with 100 closed lockers, you walk past the lockers 100 times. On the first pass, you toggle every locker (open if closed, close if open). On the second pass, you toggle every second locker (2, 4, 6, ...). On the third, every third locker, and so on. After 100 passes, which lockers are open?",
        options: ["All prime numbered lockers", "All even numbered lockers", "Perfect squares", "Perfect cubes"],
        correctAnswer: "Perfect squares",
        hint: "A locker is toggled when you visit a multiple of its number",
        answered: false,
        selectedAnswer: null
      },
      {
        id: 2,
        text: "You have two identical eggs and access to a 100-story building. You need to determine the highest floor from which an egg can be dropped without breaking. What is the minimum number of egg drops needed to find this floor in the worst case?",
        options: ["7", "10", "14", "50"],
        correctAnswer: "14",
        hint: "Consider a strategy where you vary the step size",
        answered: false,
        selectedAnswer: null
      },
      {
        id: 3,
        text: "If five cats can catch five mice in five minutes, how many cats are needed to catch 100 mice in 100 minutes?",
        options: ["5 cats", "20 cats", "25 cats", "100 cats"],
        correctAnswer: "5 cats",
        hint: "Consider the rate at which each cat catches mice",
        answered: false,
        selectedAnswer: null
      }
    ]
  }
];

// Generate a password based on the correct answers from a question set
export const generatePassword = (questionSet: QuestionSet): string => {
  return questionSet.questions
    .map(q => q.correctAnswer.charAt(0))
    .join("");
};
