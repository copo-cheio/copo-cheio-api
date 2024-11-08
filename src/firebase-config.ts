import * as admin from "firebase-admin";
import * as path from "path";

// Path to your service account key
const serviceAccount = require(path.resolve(
  __dirname,
  "../data/firebaseServiceAccount.json"
));

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "copo-cheio-4c6f3",

    clientEmail:
      "firebase-adminsdk-nb8ri@copo-cheio-4c6f3.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjdN5/niCtH1a6\nW4zdXTqpU1cnW+c50pUNfii7RcO29e7QuIvzkJEhquBVNEnJzk4CpKJQr25Nhp7H\nuvQiF4QbdbTifx9Hwbjyc8VDZJmE1UMV+8Kl8tw3VGTEnmYQuxVDKhTew1GUcR/z\nmr+perYeVFjTE2c0bQD02jWMHXhyBB6EQKu9pchPguw6WEWeUVBNNxmeoYfXeZB6\nNPLr179kIKBwsgllg1dsWEbI60lcHjHR978zLlouQzzUU/pDyA8QDKzyfEBNwAIq\nTEI2d2N3bsjxPJt2+OimJ6a6ZgZgs9gbXFI6fgJJUiCSfDqyoe6JjN1qJ8KauV5J\n1jBfvEafAgMBAAECggEAKrd1GjbR5UxmVudsBcHCfdPI2AFdiS/uQgtxS5es0Riu\nY5+G+40RUJIedEXo7rNakbhCrwFZuyruPdYuzOYGYUK+ld6Q5yjKU5pLuBQHRr6Q\n/KLBuKqiQFduyi93DvJFWTsbHyg+HqP9rKUJZ5opE/4JBIhylTHTaSnJiqd8/ZaJ\nAxY4PQvs3/rBJ+he2Cg0WEt8KM+MdolSLahHwTajwY2pOMjWfuOmVPXRYYQYVBo3\nsnFsRmMybtatqPx6J6i7RpOzDV95SmhWKh7lMrWstZLWcPIVxcLfophn0qaMvO54\nXLAl6lQFd0TV1R8s8Jy8crX46pJhUXRh5M8CMS5KmQKBgQDT4DgARvBzfywNEFRL\n7duKJ16XsxvffiN07D+yWJMOcAIcJ6Z4xzpUms1Qrj6OeRqdJGANoYcP+MGNmhqw\ne8Tqjnqn3qEbVYifMjC/v+L4v8hJtDIXH6pUdEpJi41fOeoubItwj2Hi5nWBo6wc\nXBNQyrHpKpoGQgQiTcrwz5l64wKBgQDFf0Ko7wP8A6Dq/gxN+7+H3tlpmLgdeUB0\nFj1GxV2E13WShfgKLDTQaFesK6mbv7cwV8d0OojM5DjmORnHCVVDZbWR2UzWaLqs\nhG41HhgvTHiYFXfUak9hTsHHvY5jv2FTx3icCZOsTbypi8Xg998mjNnLNc29uWAu\nBWMq35KmFQKBgGxxG1iQ9mq20U4SaILASBhq1BBivMZj4jPq4yMeEI5YJ8xPQvYY\nSjOZU7KSrDPxqfx57KutW9qB4FbgY/6mKoA+0mpvGRhLa/THFIpf5QSZ7CJFF0oc\ni+pT5t3DjmUJ2GFQbwH6cQhYGhZzNhkBy2UTiYGkq1a+nS0Nkew05QIvAoGBAKid\nkzsJ/bvfGTcoOTcnVYnaMILgWWkIiYfTKPPQM5zkG0RCztdYkKrSOvAKwx7vWqaS\nev53ry5HN3EPlTuCc2I8Zv2jqd9wwNfjpPgCvqE7R8aIpascLLOmevlelEADOERA\nDHAkGQlFwWp7pDEDT2jpXlUJlaOCrmP8Q4NqKBlVAoGAUI1ncZa/HuP+e6xEu4+V\nvEwUq6f/x0IwY4uaV7S0tWHwrohTJgok8n4dQ3liYlI8jEKIoPTNHEFJpZzeqjLM\nsXB4cb9BP8/MzUUjC8aly/0BgJFAeDSjn2jr9EPsCRp7CruIV/ZbJHSlRIFJRubf\nK212fOMggQyyHv7hjW3Te2k=\n-----END PRIVATE KEY-----\n".replace(
      /\\n/g,
      "\n"
    ),
  }),
});

export const sendNotification = async (
  token: string,
  payload: admin.messaging.NotificationMessagePayload
) => {
  try {
    const message: admin.messaging.Message = {
      notification: payload,
      token: token,
    };
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export {admin,serviceAccount};

