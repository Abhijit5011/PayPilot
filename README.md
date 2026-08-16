## PayPilot - AI Powered, Zero-Trust Payment Authorization Middleware
<div align="left">
  <a href="https://paypilot-killswitch.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
  </a>
  <a href="https://github.com/Abhijit5011/PayPilot">
    <img src="https://img.shields.io/badge/GitHub%20Repo-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo">
  </a>
  <a href="https://youtu.be/4UgpIkEZqLE">
    <img src="https://img.shields.io/badge/Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube Demo">
  </a>
</div>

<p>
  <strong>
    PayPilot is a zero-trust, four-workflow payment middleware that lets an AI agent participate in payment flows without ever gaining direct access to money, databases, or Stripe credentials.
  </strong>
</p>

<h3> Key Features & Impact</h3>

<ul>
  <li><strong>Zero-Trust Security:</strong> AI can interpret payment intent but never access money, Stripe credentials, or the database.</li>
  <li><strong>5-Checkpoint Circuit Breaker:</strong> <code>is_frozen</code> is verified across 5 checkpoints to prevent unauthorized execution and race conditions.</li>
  <li><strong> Deterministic Authorization:</strong> Allowlists, spending limits, system state, and transaction conditions are independently validated.</li>
  <li><strong> Complete Auditability:</strong> Critical system and payment actions are persistently recorded and traceable.</li>

</ul>

<h3>🔄 Four-Workflow Architecture</h3>

<table>
<tr>
<td width="50%" valign="top">

<strong>01 · 🚨 Kill Switch API</strong><br>
Instantly freezes the payment pipeline and records the operator action. <br>
<img src="https://raw.githubusercontent.com/Abhijit5011/PayPilot/main/assets/workflow-a.png" width="100%"/>
</td>
<td width="50%" valign="top">

<strong>02 · 🤖 AI Agent Gate</strong><br>
Gemini 2.5 Flash extracts structured payment intent without database or Stripe access.
<img src="https://raw.githubusercontent.com/Abhijit5011/PayPilot/main/assets/workflow-b.png" width="100%"/>

</td>
</tr>

<tr>
<td width="50%" valign="top">

<strong>03 · 🔐 Authorization Middleware</strong><br>
Validates allowlists, spending limits, frozen state, and final transaction conditions.
<img src="https://raw.githubusercontent.com/Abhijit5011/PayPilot/main/assets/workflow-c.png" width="100%"/>

</td>
<td width="50%" valign="top">

<strong>04 · 💳 Payment Executor</strong><br>
The only trusted layer with Stripe credentials, responsible for final validation, PaymentIntent creation.
<img src="https://raw.githubusercontent.com/Abhijit5011/PayPilot/main/assets/workflow-d.png" width="100%"/>

</td>
</tr>
</table>

<p align="center">
  <strong>AI Intent → Deterministic Authorization → Secure Payment Execution</strong>
</p>
<img src="./architecture-paypilot.png" alt="PayPilot Architecture" width="100%">  

<li>
  <strong>Tech Stack:</strong>
  <code style="background-color:#4DB6D6;color:#fff;padding:4px 8px;border-radius:5px;">React 18</code>
  <code style="background-color:#5961C9;color:#fff;padding:4px 8px;border-radius:5px;">Vite</code>
  <code style="background-color:#1595A8;color:#fff;padding:4px 8px;border-radius:5px;">Tailwind CSS</code>
  <code style="background-color:#C44567;color:#fff;padding:4px 8px;border-radius:5px;">n8n Cloud</code>
  <code style="background-color:#735F91;color:#fff;padding:4px 8px;border-radius:5px;">Gemini API</code>
  <code style="background-color:#514BB0;color:#fff;padding:4px 8px;border-radius:5px;">Stripe PaymentIntents</code>
  <code style="background-color:#329B6E;color:#fff;padding:4px 8px;border-radius:5px;">Supabase Postgres</code>
</li>
</ul>
<br>
<table>
<tr>
<td><img src="https://raw.githubusercontent.com/Abhijit5011/PayPilot/main/assets/kill-switch-wallet.jpeg" width="100%"/></td>
<td><img src="https://raw.githubusercontent.com/Abhijit5011/PayPilot/main/assets/stripe-transactions.png" width="100%"/></td>
</tr>

</table>



<br/>
