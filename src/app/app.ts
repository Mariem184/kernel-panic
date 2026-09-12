import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { StayConnectedComponent } from './components/stay-connected/stay-connected.component';
import { WhoWeAreComponent } from './components/who-we-are/who-we-are.component';
import { MissionValuesComponent } from './components/mission-values/mission-values.component';
import { ServicesComponent } from './components/services/services.component';
import { WhyChooseUsComponent } from './components/why-choose-us/why-choose-us.component';
import { ProcessComponent } from './components/process/process.component';
import { SoundFamiliarComponent } from './components/sound-familiar/sound-familiar.component';
import { FinalCtaComponent } from './components/final-cta/final-cta.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    ChatbotComponent,
    StayConnectedComponent,
    WhoWeAreComponent,
    MissionValuesComponent,
    ServicesComponent,
    WhyChooseUsComponent,
    ProcessComponent,
    SoundFamiliarComponent,
    FinalCtaComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
