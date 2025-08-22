<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Document;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Terms of Service document
        Document::updateOrCreate(
            ['slug' => 'terms'],
            [
                'title' => 'Terms of Service',
                'version' => '1.0',
                'content' => $this->getTermsContent(),
                'updated_by' => null,
            ]
        );
        
        // Create Privacy Policy document
        Document::updateOrCreate(
            ['slug' => 'privacy'],
            [
                'title' => 'Privacy Policy',
                'version' => '1.0',
                'content' => $this->getPrivacyContent(),
                'updated_by' => null,
            ]
        );
    }
    
    private function getTermsContent()
    {
        return '<p><strong>Version: 1.0</strong><br><strong>Last updated: January 18, 2025</strong></p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Gymwolf.com ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily use Gymwolf for personal, non-commercial purposes. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
<ul>
<li>modify or copy the materials;</li>
<li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
<li>attempt to decompile or reverse engineer any software contained on Gymwolf;</li>
<li>remove any copyright or other proprietary notations from the materials.</li>
</ul>
<p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by FitQ Studio at any time.</p>

<h2>3. User Account</h2>
<p>To use certain features of the Service, you must register for an account. When you register for an account, you agree to:</p>
<ul>
<li>provide accurate, current, and complete information;</li>
<li>maintain and promptly update your account information;</li>
<li>maintain the security of your password and accept all risks of unauthorized access;</li>
<li>be responsible for all activities that occur under your account.</li>
</ul>

<h2>4. User Content</h2>
<p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>
<p>By posting Content on or through the Service, you represent and warrant that:</p>
<ul>
<li>Content is yours (you own it) and/or you have the right to use it;</li>
<li>Content does not infringe, violate or misappropriate the rights of any third party;</li>
<li>Content does not contain any harmful, unlawful, or offensive material.</li>
</ul>

<h2>5. Privacy</h2>
<p>Your use of our Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.</p>

<h2>6. Prohibited Uses</h2>
<p>You may not use our Service:</p>
<ul>
<li>For any unlawful purpose or to solicit others to perform unlawful acts;</li>
<li>To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances;</li>
<li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others;</li>
<li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate;</li>
<li>To submit false or misleading information;</li>
<li>To upload or transmit viruses or any other type of malicious code;</li>
<li>To interfere with or circumvent the security features of the Service.</li>
</ul>

<h2>7. Disclaimer</h2>
<p>The information on Gymwolf is provided on an "as is" basis. To the fullest extent permitted by law, this Company:</p>
<ul>
<li>excludes all representations and warranties relating to this website and its contents;</li>
<li>excludes all liability for damages arising out of or in connection with your use of this website.</li>
</ul>

<h2>8. Medical Disclaimer</h2>
<p>The information provided on Gymwolf is for general informational purposes only. It is not intended as and should not be relied upon as medical advice. Always consult with a qualified healthcare professional before beginning any exercise program or making changes to your diet or lifestyle.</p>

<h2>9. Limitation of Liability</h2>
<p>In no event shall FitQ Studio, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Service. FitQ Studio shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Service.</p>

<h2>10. Indemnification</h2>
<p>You hereby indemnify to the fullest extent FitQ Studio from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.</p>

<h2>11. Termination</h2>
<p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
<p>Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service or contact us to delete your account.</p>

<h2>12. Account Deletion and Data Retention</h2>
<p>You may request deletion of your account at any time through your account settings or by contacting us. Upon account deletion:</p>
<ul>
<li>Your personal data will be deleted within 30 days</li>
<li>Anonymized workout statistics may be retained for analytical purposes</li>
<li>We may retain certain data as required by law or for legitimate business purposes</li>
<li>Backup systems may retain copies for up to 90 days</li>
</ul>

<h2>13. Governing Law</h2>
<p>These Terms shall be governed and construed in accordance with the laws of Estonia, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>

<h2>14. Changes to Terms</h2>
<p>FitQ Studio reserves the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>

<h2>15. Contact Information</h2>
<p>If you have any questions about these Terms, please contact us at:</p>
<p>FitQ Studio<br>
Email: info@fitq.me<br>
Website: gymwolf.com</p>';
    }
    
    private function getPrivacyContent()
    {
        return '<p><strong>Version: 1.0</strong><br><strong>Last updated: January 18, 2025</strong></p>

<h2>1. Introduction</h2>
<p>FitQ Studio ("we," "our," or "us") operates Gymwolf.com (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
<p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

<h2>2. Information Collection and Use</h2>
<p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>

<h3>Types of Data Collected</h3>

<h4>Personal Data</h4>
<p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to:</p>
<ul>
<li>Email address</li>
<li>First name and last name</li>
<li>Phone number (optional)</li>
<li>Address, City, Country (optional)</li>
<li>Fitness and health data (weight, height, workout history)</li>
<li>Cookies and Usage Data</li>
</ul>

<h4>Usage Data</h4>
<p>We may also collect information on how the Service is accessed and used. This Usage Data may include information such as your computer\'s Internet Protocol address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>

<h2>3. Use of Data</h2>
<p>Gymwolf uses the collected data for various purposes:</p>
<ul>
<li>To provide and maintain the Service</li>
<li>To notify you about changes to our Service</li>
<li>To allow you to participate in interactive features of our Service</li>
<li>To provide customer care and support</li>
<li>To provide analysis or valuable information to improve the Service</li>
<li>To monitor the usage of the Service</li>
<li>To detect, prevent and address technical issues</li>
<li>To provide you with news, special offers and general information</li>
</ul>

<h2>4. Data Storage and Security</h2>
<p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
<p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.</p>

<h2>5. Data Retention</h2>
<p>We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>

<h2>6. Transfer of Data</h2>
<p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.</p>
<p>If you are located outside Estonia and choose to provide information to us, please note that we transfer the data, including Personal Data, to Estonia and process it there.</p>

<h2>7. Your Data Protection Rights (GDPR)</h2>
<p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR). FitQ Studio aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>
<p>If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.</p>
<p>In certain circumstances, you have the following data protection rights:</p>
<ul>
<li>The right to access, update or delete the information we have on you</li>
<li>The right of rectification</li>
<li>The right to object</li>
<li>The right of restriction</li>
<li>The right to data portability (export your data in a machine-readable format)</li>
<li>The right to withdraw consent</li>
<li>The right to lodge a complaint with a supervisory authority</li>
</ul>
<p>To exercise these rights, please contact us at info@fitq.me. We will respond to your request within 30 days.</p>

<h2>8. Cookies</h2>
<p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amounts of data which may include an anonymous unique identifier.</p>
<p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>

<h2>9. Third-Party Services</h2>
<p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used.</p>
<p>These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>

<h2>10. Analytics</h2>
<p>We may use third-party Service Providers to monitor and analyze the use of our Service. These providers may include Google Analytics and similar services that track usage and help us improve our Service.</p>

<h2>11. Data Breach Notification</h2>
<p>In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify you without undue delay and, where feasible, no later than 72 hours after becoming aware of the breach. The notification will describe the nature of the breach and the measures we have taken to address it.</p>

<h2>12. Special Categories of Personal Data</h2>
<p>Health and fitness data is considered a special category of personal data under GDPR. We process this data based on your explicit consent. This includes:</p>
<ul>
<li>Workout and exercise data</li>
<li>Body measurements and statistics</li>
<li>Health-related goals and progress</li>
</ul>
<p>You may withdraw consent for processing this data at any time by contacting us.</p>

<h2>13. Data Export</h2>
<p>You have the right to export your data at any time. You can request a copy of your personal data in a structured, commonly used, and machine-readable format (JSON or CSV) by contacting us at info@fitq.me.</p>

<h2>14. Children\'s Privacy</h2>
<p>Our Service does not address anyone under the age of 16. We do not knowingly collect personally identifiable information from anyone under the age of 16. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.</p>

<h2>15. Changes to This Privacy Policy</h2>
<p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.</p>
<p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

<h2>16. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us:</p>
<p>FitQ Studio<br>
Email: info@fitq.me<br>
Website: gymwolf.com</p>';
    }
}