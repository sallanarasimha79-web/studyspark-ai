# StudySpark AI — free-to-host study website

A responsive Class 1–12 study assistant starter with four teaching modes:
- Super simple
- Step by step
- Exam answer
- Quiz me

It includes a demo fallback, theme toggle, suggested prompts, mobile layout, and a server-side OpenAI Responses API function.

## Important: hosting vs AI costs
- Static hosting can be free on a suitable Netlify plan.
- Real AI responses require an OpenAI API key. API billing/access is separate from a ChatGPT subscription and may cost money.
- The website cannot promise perfect answers or instant responses every time. Ask students to verify important schoolwork with their textbook or teacher.
- Never put the API key in `app.js`, `index.html`, or any public Git repository.

## Publish on Netlify (recommended)
The site uses a Netlify Function, so deploy the project as a Git repository rather than using a static-only drag-and-drop upload.

1. Create a GitHub account if you don't already have one (follow the service's age and account rules; ask a parent/guardian for help if needed).
2. Create a **new private repository** named `studyspark-ai` on GitHub.
3. Upload the contents of this folder to the repository (upload the files and folders, not the outer ZIP).
4. Sign in to Netlify and choose **Add new site / Import an existing project**. Connect GitHub and select `studyspark-ai`.
5. Set the publish directory to `.` if Netlify asks. The included `netlify.toml` already specifies the site and function folders.
6. Deploy. Netlify should give you a public `*.netlify.app` URL. Test the page first; without an API key it will show demo-mode help.

## Connect real AI answers
1. Create an OpenAI API key in the OpenAI developer platform and check the API billing/access requirements.
2. In Netlify, open your site settings and find **Environment variables**.
3. Add `OPENAI_API_KEY` with your secret key as the value. Do not share this key with anyone or commit it to GitHub.
4. Optional: add `OPENAI_MODEL` to choose a model enabled for your API account. If omitted, this project defaults to `gpt-5-mini`.
5. Trigger a fresh deploy after adding variables.
6. Try asking a question. If it fails, check Netlify function logs and the OpenAI API account/billing status.

## Test without connecting AI
Open `index.html` directly in a browser to inspect the design. The chat will use demo answers when the server endpoint is not available. To test the server function properly, deploy to Netlify.

## Customise
- Edit `index.html` for page content.
- Edit `styles.css` for design and responsive layout.
- Edit `app.js` for UI interactions and demo messages.
- Edit `netlify/functions/ask.mjs` for AI behaviour.

## Privacy and safety
This starter does not intentionally save chat messages to a database. Requests are sent to your configured AI provider when the function is connected. Before sharing the site widely, add a privacy notice, abuse/rate-limit controls, and appropriate protections against unexpected API usage. For a public student site, do not collect student names, exact birth dates, school IDs, or other unnecessary personal information.
