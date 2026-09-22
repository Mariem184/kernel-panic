import { Component } from '@angular/core';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { HeroComponent } from '../components/hero/hero.component';
import { ChatbotComponent } from '../components/chatbot/chatbot.component';
import { FloatingWhatsappComponent } from '../components/floating-whatsapp/floating-whatsapp.component';
import { StayConnectedComponent } from '../components/stay-connected/stay-connected.component';
import { WhoWeAreComponent } from '../components/who-we-are/who-we-are.component';
import { MissionValuesComponent } from '../components/mission-values/mission-values.component';
import { ServicesComponent } from '../components/services/services.component';
import { ProjectsComponent } from '../components/projects/projects.component';
import { NewsComponent } from '../components/news/news.component';
import { WhyChooseUsComponent } from '../components/why-choose-us/why-choose-us.component';
import { ProcessComponent } from '../components/process/process.component';
import { SoundFamiliarComponent } from '../components/sound-familiar/sound-familiar.component';
import { FinalCtaComponent } from '../components/final-cta/final-cta.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    ChatbotComponent,
    FloatingWhatsappComponent,
    StayConnectedComponent,
    WhoWeAreComponent,
    MissionValuesComponent,
    ServicesComponent,
    ProjectsComponent,
    WhyChooseUsComponent,
    ProcessComponent,
    NewsComponent,
    SoundFamiliarComponent,
    FinalCtaComponent,
    FooterComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}