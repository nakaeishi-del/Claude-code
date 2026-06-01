import { Webinar } from './types';
import { generateTasks } from './tasks';

export function createSampleWebinar(): Webinar {
  const id = 'sample-001';
  const webinarBase: Omit<Webinar, 'tasks'> = {
    id,
    title: '読む力が受験を変える！「自分で学べる子」になるための方法',
    date: '2026-06-15',
    dayOfWeek: '月',
    startTime: '11:00',
    endTime: '12:00',
    targetAudience: '中学受験を検討している保護者',
    theme: '受験につながる読む力',
    speaker: '笹沼颯太',
    mainProblem: '塾で習ったことはわかるのに、家で一人だとなかなか勉強が進まない……',
    empathyText: 'そんなお悩みの背景には、問題文を正しく読み取り、自分で学びを進めるための「読む力」が関係しているかもしれません。',
    takeaways: [
      '中学受験に必要な読む力の正体',
      '自分で学べる子になるための読書習慣の作り方',
      '無理なく読書を続けられる家庭環境の整え方',
    ],
    zoomUrl: '',
    zoomMeetingId: '',
    zoomPasscode: '',
    zoomAdminUrl: '',
    formUrl: '',
    formEditUrl: '',
    responseSheetUrl: '',
    surveyUrl: '',
    lpUrl: '',
    lpEditUrl: '',
    eventListUrl: '',
    youtubeUrl: '',
    youtubeStudioUrl: '',
    thumbnailUrl: '',
    figmaUrl: '',
    mailToolUrl: '',
    lineRequestUrl: '',
    slackUrl: '',
    yondemyLpUrl: 'https://lp.yondemy.com/?utm_source=seminar&utm_medium=2026webinar',
    hamaruUrl: '',
    relatedArchives: [
      {
        title: '国語の偏差値+27に学ぶ 全教科の成績を伸ばす「学ぶ力」の育て方',
        url: 'https://yondemy.wraptas.site/seminar_example',
      }
    ],
    relatedNotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const webinar = webinarBase as Webinar;
  return { ...webinar, tasks: generateTasks(webinar) };
}
