/**
 * 版本：V1(2023/9/25)
 * 描述：用于优化选课时课程时间冲突的提示
 */

function parseTime(inputData) {
  const regex = /星期([一二三四五六日])第(\d+)-(\d+)节{([^}]+)}/g;

  const items = [];

  let match;
  while ((match = regex.exec(inputData)) !== null) {
    const dayOfWeek = match[1];
    const startPeriod = parseInt(match[2]);
    const endPeriod = parseInt(match[3]);
    const weekInfo = match[4].split(',').map(info => {
      const range = info.split('-');
      if (range.length === 2) {
        return { start: parseInt(range[0]), end: parseInt(range[1]) };
      } else {
        return { start: parseInt(info), end: parseInt(info) };
      }
    });
    const dayMapping = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      日: 7
    };

    items.push({
      day: dayMapping[dayOfWeek],
      period: [startPeriod, endPeriod],
      week: weekInfo.flatMap(info => Array.from({ length: info.end - info.start + 1 }, (_, i) => info.start + i))
    });
  }

  const result = { items };

  jsonData = JSON.stringify(result, null, 2);
  const parsedData = JSON.parse(jsonData);
  return parsedData.items;
}

function checkConflict(timeData1, time2) {

  const timeData2 = parseTime(time2);
  if (timeData1 && timeData2) {
    for (const item1 of timeData1) {
      for (const item2 of timeData2) {
        if (
          item1.day === item2.day &&
          item1.period[0] <= item2.period[1] &&
          item1.period[1] >= item2.period[0] &&
          item1.week.some(week1 => item2.week.some(week2 => week1 === week2))
        ) {
          return true;
        }
      }
    }
  }

  return false;
}



function parseSelectedCourses() {
  const courseArray = [];
  const courseElements = document.querySelectorAll('.outer_xkxx_list');

  courseElements.forEach(courseElement => {
    const courseNameElement = courseElement.querySelector('h6');
    const courseTimeElement = courseElement.querySelector('.time');

    if (courseNameElement && courseTimeElement) {
      const courseName = courseNameElement.textContent.trim();
      const courseTime = courseTimeElement.textContent.trim();

      const courseInfo = {
        name: courseName,
        time: courseTime,
      };

      courseArray.push(courseInfo);
    }
  });

  return courseArray;
}

function parseUnselectedCourse() {
  const selectedCourseArray = parseSelectedCourses();
  const unselectedCourseElements = document.querySelectorAll('.body_tr');

  unselectedCourseElements.forEach(courseElement => {
    const courseTimeElement = courseElement.querySelector('.sksj');
    if (courseTimeElement) {
      const courseTime = courseTimeElement.textContent.trim();
      const timeData1 = parseTime(courseTime);
      selectedCourseArray.forEach(courseElement2 => {
        if (checkConflict(timeData1, courseElement2.time)) {//js的递归机制
          const waitForChange = () => {
            if (!courseElement.querySelector('.sksj').innerHTML) {
              setTimeout(waitForChange, 300);
            } else {
              const regex = /\)(.*)-/g;
              const name = regex.exec(courseElement2.name);
              courseElement.querySelector('.an').innerHTML = "<strong>时间冲突</strong><br> <strong>课程名:</strong>" + name[1] + "<br><strong>时间:</strong>" + courseElement2.time;
            }
          };
          waitForChange();
        }
      });
    }
  });
}

document.body.addEventListener('click', function(event) {
  setTimeout(function() {
    parseUnselectedCourse();
  }, 300);
});