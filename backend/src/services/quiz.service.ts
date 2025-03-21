import prisma from "../config/db";
import { QuestionType } from "../types/quiz.types";
import { sendQuizEmail } from "./email.service";

export const getClassroomQuizzes = async (classroomId: string) => {
  return prisma.quiz.findMany({
    where: {
      classroomId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getQuiz = async (
  quizId: string,
  includeQuestions: boolean = false
) => {
  return prisma.quiz.findUnique({
    where: { quizId },
    include: includeQuestions
      ? {
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
        }
      : undefined,
  });
};

export const createQuiz = async (
  userId: string,
  data: {
    title: string;
    description?: string;
    instructions?: string;
    timeLimit?: number;
    dueDate?: Date;
    classroomId: string;
    isPublished?: boolean;
    questions: Array<{
      text: string;
      type: string;
      points: number;
      orderIndex: number;
      options: Array<{
        text: string;
        isCorrect: boolean;
        orderIndex: number;
      }>;
    }>;
  }
) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: data.classroomId },
  });

  if (!classroom) {
    throw new Error("Classroom not found");
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: data.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can create quizzes for this classroom");
    }
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description || "",
      instructions: data.instructions || "",
      timeLimit: data.timeLimit,
      dueDate: data.dueDate,
      classroomId: data.classroomId,
      isPublished: data.isPublished || false,
      questions: {
        create: data.questions.map((q) => ({
          questionText: q.text,
          questionType: q.type as QuestionType,
          points: q.points,
          orderIndex: q.orderIndex,
          options: {
            create: q.options.map((o) => ({
              optionText: o.text,
              isCorrect: o.isCorrect,
              orderIndex: o.orderIndex,
            })),
          },
        })),
      },
    },
    include: {
      questions: {
        include: {
          options: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });

  if (data.isPublished) {
    sendQuizEmail(
      data.classroomId,
      quiz.quizId,
      data.title,
      data.description || "",
      data.dueDate || null,
      { firstName: user.firstName, lastName: user.lastName }
    ).catch((err) => console.error("Failed to send quiz emails:", err));
  }

  return quiz;
};

export const publishQuiz = async (userId: string, quizId: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { quizId },
    include: {
      classroom: true,
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can publish quizzes");
    }
  }

  const updatedQuiz = await prisma.quiz.update({
    where: { quizId },
    data: {
      isPublished: true,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });

  sendQuizEmail(
    quiz.classroomId,
    quizId,
    quiz.title,
    quiz.description || "",
    quiz.dueDate || null,
    { firstName: user.firstName, lastName: user.lastName }
  ).catch((err) => console.error("Failed to send quiz emails:", err));

  return updatedQuiz;
};

export const updateQuiz = async (
  userId: string,
  quizId: string,
  data: {
    title?: string;
    description?: string;
    instructions?: string;
    timeLimit?: number;
    dueDate?: Date;
    isPublished?: boolean;
  }
) => {
  const quiz = await prisma.quiz.findUnique({
    where: { quizId },
    include: {
      classroom: true,
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can update this quiz");
    }
  }

  return prisma.quiz.update({
    where: { quizId },
    data,
  });
};

export const deleteQuiz = async (userId: string, quizId: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { quizId },
    include: {
      classroom: true,
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can delete this quiz");
    }
  }
  await prisma.quiz.delete({
    where: { quizId },
  });

  return { message: "Quiz deleted successfully" };
};

export const createQuestion = async (
  userId: string,
  data: {
    quizId: string;
    questionText: string;
    questionType: QuestionType;
    points?: number;
    options?: {
      optionText: string;
      isCorrect: boolean;
      orderIndex: number;
    }[];
    orderIndex: number;
  }
) => {
  const quiz = await prisma.quiz.findUnique({
    where: { quizId: data.quizId },
    include: {
      classroom: true,
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can add questions to this quiz");
    }
  }

  const question = await prisma.question.create({
    data: {
      quizId: data.quizId,
      questionText: data.questionText,
      questionType: data.questionType,
      points: data.points || 1,
      orderIndex: data.orderIndex,
    },
  });

  if (data.options && data.options.length > 0) {
    await Promise.all(
      data.options.map((option) =>
        prisma.option.create({
          data: {
            questionId: question.questionId,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            orderIndex: option.orderIndex,
          },
        })
      )
    );
  }

  return prisma.question.findUnique({
    where: { questionId: question.questionId },
    include: {
      options: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });
};

export const updateQuestion = async (
  userId: string,
  questionId: string,
  data: {
    questionText?: string;
    questionType?: QuestionType;
    points?: number;
    orderIndex?: number;
  }
) => {
  const question = await prisma.question.findUnique({
    where: { questionId },
    include: {
      quiz: {
        include: {
          classroom: true,
        },
      },
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: question.quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can update this question");
    }
  }

  return prisma.question.update({
    where: { questionId },
    data,
    include: {
      options: {
        orderBy: {
          orderIndex: "asc",
        },
      },
    },
  });
};

export const deleteQuestion = async (userId: string, questionId: string) => {
  const question = await prisma.question.findUnique({
    where: { questionId },
    include: {
      quiz: {
        include: {
          classroom: true,
        },
      },
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: question.quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can delete this question");
    }
  }

  await prisma.question.delete({
    where: { questionId },
  });

  return { message: "Question deleted successfully" };
};

export const createOption = async (
  userId: string,
  data: {
    questionId: string;
    optionText: string;
    isCorrect: boolean;
    orderIndex: number;
  }
) => {
  const question = await prisma.question.findUnique({
    where: { questionId: data.questionId },
    include: {
      quiz: {
        include: {
          classroom: true,
        },
      },
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  if (question.quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: question.quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can add options to this question");
    }
  }

  return prisma.option.create({
    data: {
      questionId: data.questionId,
      optionText: data.optionText,
      isCorrect: data.isCorrect,
      orderIndex: data.orderIndex,
    },
  });
};

export const updateOption = async (
  userId: string,
  optionId: string,
  data: {
    optionText?: string;
    isCorrect?: boolean;
    orderIndex?: number;
  }
) => {
  const option = await prisma.option.findUnique({
    where: { optionId },
    include: {
      question: {
        include: {
          quiz: {
            include: {
              classroom: true,
            },
          },
        },
      },
    },
  });

  if (!option) {
    throw new Error("Option not found");
  }

  if (option.question.quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: option.question.quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can update this option");
    }
  }

  return prisma.option.update({
    where: { optionId },
    data,
  });
};

export const deleteOption = async (userId: string, optionId: string) => {
  const option = await prisma.option.findUnique({
    where: { optionId },
    include: {
      question: {
        include: {
          quiz: {
            include: {
              classroom: true,
            },
          },
        },
      },
    },
  });

  if (!option) {
    throw new Error("Option not found");
  }

  if (option.question.quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: option.question.quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can delete this option");
    }
  }

  await prisma.option.delete({
    where: { optionId },
  });

  return { message: "Option deleted successfully" };
};

export const startQuizAttempt = async (userId: string, quizId: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: {
      quizId,
      isPublished: true,
    },
    include: {
      classroom: true,
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found or not published");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      classroomId: quiz.classroomId,
      role: "STUDENT",
    },
  });

  if (!enrollment && quiz.classroom.ownerId !== userId) {
    throw new Error("You are not enrolled in this classroom");
  }

  if (quiz.dueDate && new Date() > quiz.dueDate) {
    throw new Error("This quiz is past its due date");
  }

  const existingAttempt = await prisma.quizAttempt.findUnique({
    where: {
      quizId_userId: {
        quizId,
        userId,
      },
    },
  });

  if (existingAttempt) {
    if (!existingAttempt.submittedAt) {
      return existingAttempt;
    }
    throw new Error("You have already completed this quiz");
  }

  return prisma.quizAttempt.create({
    data: {
      quizId,
      userId,
    },
  });
};

export const submitQuizAttempt = async (
  userId: string,
  attemptId: string,
  answers: {
    questionId: string;
    selectedOptions?: string[];
    textAnswer?: string;
  }[]
) => {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.userId !== userId) {
    throw new Error("This attempt does not belong to you");
  }

  if (attempt.submittedAt) {
    throw new Error("This attempt has already been submitted");
  }

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const answer of answers) {
    const question = attempt.quiz.questions.find(
      (q) => q.questionId === answer.questionId
    );

    if (!question) {
      continue;
    }

    totalPoints += question.points;
    let isCorrect = false;
    let points = 0;

    switch (question.questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        if (answer.selectedOptions && answer.selectedOptions.length === 1) {
          const correctOption = question.options.find((o) => o.isCorrect);
          isCorrect = correctOption?.optionId === answer.selectedOptions[0];
          points = isCorrect ? question.points : 0;
        }
        break;

      case QuestionType.MULTIPLE_ANSWER:
        if (answer.selectedOptions) {
          const correctOptions = question.options
            .filter((o) => o.isCorrect)
            .map((o) => o.optionId);

          const incorrectSelections = answer.selectedOptions.filter(
            (id) => !correctOptions.includes(id)
          );

          const missedCorrect = correctOptions.filter(
            (id) => !answer.selectedOptions?.includes(id)
          );

          isCorrect =
            incorrectSelections.length === 0 && missedCorrect.length === 0;

          if (incorrectSelections.length === 0 && missedCorrect.length > 0) {
            points =
              (question.points *
                (correctOptions.length - missedCorrect.length)) /
              correctOptions.length;
          } else if (
            incorrectSelections.length > 0 &&
            missedCorrect.length === 0
          ) {
            points =
              (question.points *
                (question.options.length - incorrectSelections.length)) /
              question.options.length;
          } else if (isCorrect) {
            points = question.points;
          }
        }
        break;

      case QuestionType.SHORT_ANSWER:
        if (answer.textAnswer) {
          const correctOption = question.options.find((o) => o.isCorrect);
          isCorrect =
            correctOption?.optionText.toLowerCase() ===
            answer.textAnswer.toLowerCase();
          points = isCorrect ? question.points : 0;
        }
        break;

      case QuestionType.ESSAY:
        isCorrect = false;
        points = 0;
        break;
    }

    await prisma.answer.create({
      data: {
        attemptId,
        questionId: question.questionId,
        selectedOptions: answer.selectedOptions || [],
        textAnswer: answer.textAnswer,
        isCorrect,
        points,
      },
    });

    if (points !== null) {
      earnedPoints += points;
    }
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  return prisma.quizAttempt.update({
    where: { attemptId },
    data: {
      submittedAt: new Date(),
      score,
    },
    include: {
      answers: true,
    },
  });
};

export const getQuizAttempt = async (userId: string, attemptId: string) => {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { attemptId },
    include: {
      quiz: {
        include: {
          classroom: true,
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      },
      answers: true,
      user: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePic: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.userId !== userId && attempt.quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: attempt.quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("You do not have permission to view this attempt");
    }
  }

  return attempt;
};

export const getQuizAttempts = async (userId: string, quizId: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { quizId },
    include: {
      classroom: true,
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  if (quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can view all attempts for this quiz");
    }
  }

  return prisma.quizAttempt.findMany({
    where: { quizId },
    include: {
      user: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePic: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
};

export const gradeEssayQuestion = async (
  userId: string,
  answerId: string,
  points: number
) => {
  const answer = await prisma.answer.findUnique({
    where: { answerId },
    include: {
      question: true,
      attempt: {
        include: {
          quiz: {
            include: {
              classroom: true,
            },
          },
        },
      },
    },
  });

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.attempt.quiz.classroom.ownerId !== userId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        classroomId: answer.attempt.quiz.classroomId,
        role: "TEACHER",
      },
    });

    if (!enrollment) {
      throw new Error("Only teachers can grade essay questions");
    }
  }

  if (answer.question.questionType !== QuestionType.ESSAY) {
    throw new Error("This is not an essay question");
  }

  if (points < 0 || points > answer.question.points) {
    throw new Error(`Points must be between 0 and ${answer.question.points}`);
  }

  await prisma.answer.update({
    where: { answerId },
    data: {
      points,
      isCorrect: points > 0,
    },
  });

  const attempt = await prisma.quizAttempt.findUnique({
    where: { attemptId: answer.attemptId },
    include: {
      answers: true,
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const q of attempt.quiz.questions) {
    totalPoints += q.points;
  }

  for (const a of attempt.answers) {
    if (a.points !== null) {
      earnedPoints += a.points;
    }
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  return prisma.quizAttempt.update({
    where: { attemptId: answer.attemptId },
    data: {
      score,
    },
  });
};
