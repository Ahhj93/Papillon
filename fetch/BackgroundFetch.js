import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import * as Notifications from 'expo-notifications';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IndexDataInstance } from './IndexDataInstance';
import { ucFirst } from './SkolengoData/SkolengoDatas';

// Actualités
TaskManager.defineTask('background-fetch-news', async () => {
  const dataInstance = new IndexDataInstance();
  return AsyncStorage.getItem('oldNews').then((oldNews) => {
    if (oldNews) {
      oldNews = JSON.parse(oldNews);

      return dataInstance.getNews().then((news) => {
        if (news.length !== oldNews.length) {
          AsyncStorage.setItem('oldNews', JSON.stringify(news));

          const lastNews = news[0];

          Notifications.scheduleNotificationAsync({
            content: {
              subtitle: `📰 Nouvelle actualité ${ucFirst(
                dataInstance.service
              )}`,
              body: lastNews.title,
              sound: 'papillon_ding.wav',
            },
            trigger: null,
          });

          // Be sure to return the successful result type!
          return BackgroundFetch.BackgroundFetchResult.NewData;
        }
      });
    }
    return dataInstance.getNews().then((news) => {
      Notifications.scheduleNotificationAsync({
        content: {
          subtitle: 'Notifications actives !',
          body: 'Vous recevrez maintenant une notification à chaque nouvelle actualité Pronote',
          sound: 'papillon_ding.wav',
        },
        trigger: null,
      });

      AsyncStorage.setItem('oldNews', JSON.stringify(news));
    });
  });
});

// News Register
async function registerNewsBackgroundFetchAsync() {
  if (!BackgroundFetch?.registerTaskAsync) {
    throw new Error(
      'BackgroundFetch.registerTaskAsync is not defined. (dev only)'
    );
  }
  return BackgroundFetch?.registerTaskAsync('background-fetch-news', {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

function setBackgroundFetch() {
  registerNewsBackgroundFetchAsync()
    ?.then(() => {
      console.log("Successfully registered 'background-fetch-news' fetch task");
    })
    .catch((err) => {
      console.log("Task 'background-fetch-news' not registered", err);
    });
}

export default setBackgroundFetch;
