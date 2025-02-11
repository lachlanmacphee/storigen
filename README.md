# Storigen

## Setup

Clone this repository by running the command:

`git clone https://github.com/lachlanmacphee/storigen.git`

Once you have cloned the repo, open it in VS Code or similar.

Populate the `.env` file using the example provided.

Install the Stripe CLI and run the following command:

```
stripe listen --forward-to localhost:3000/api/webhook
```

Run the following commands:

```
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Then in a browser, navigate to:
http://localhost:3000
