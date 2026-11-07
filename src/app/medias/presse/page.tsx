import { notFound } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'Espace Presse Aspeo | Communiqués & Ressources Médias',
//   description: 'Accédez aux communiqués de presse, ressources médias, logos et contacts presse officiels d\'Aspeo.',
//   keywords: 'dossiers de presse nettoyage, communiqués Aspeo, télécharger documents presse, informations médias propreté, kit presse Aspeo',
//   openGraph: {
//     title: 'Espace Presse Aspeo | Communiqués & Ressources Médias',
//     description: 'Accédez aux communiqués de presse, ressources médias, logos et contacts presse officiels d\'Aspeo.',
//     type: 'website',
//   },
// };

const PressePage = () => {
  // Section presse temporairement désactivée
  notFound();

  // const breadcrumbItems = [
  //   { label: 'Médias', href: '/medias' },
  //   { label: 'Presse' }
  // ];

  // Trier par date décroissante et ajouter la taille des fichiers
  // const sortedPresse = [...presseData]
  //   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  //   .map((presse) => ({
  //     ...presse,
  //     fileSize: getFileSize(presse.pdfUrl),
  //   }));

  // Ajouter la taille des fichiers au kit média
  // const kitMediaWithSize = kitMediaData.map((item) => ({
  //   ...item,
  //   fileSize: getFileSize(item.downloadUrl),
  // }));

  // const jsonLd = {
  //   '@context': 'https://schema.org',
  //   '@type': 'CollectionPage',
  //   name: 'Presse Aspeo',
  //   description: metadata.description,
  //   mainEntity: {
  //     '@type': 'ItemList',
  //     numberOfItems: sortedPresse.length,
  //     itemListElement: sortedPresse.map((presse, index) => ({
  //       '@type': 'ListItem',
  //       position: index + 1,
  //       item: {
  //         '@type': 'DigitalDocument',
  //         name: presse.title,
  //         description: presse.description,
  //         datePublished: presse.date,
  //         encodingFormat: 'application/pdf',
  //       },
  //     })),
  //   },
  // };

  // return (
  //   <div className="pt-12">
  //     <Script
  //       id="json-ld-presse"
  //       type="application/ld+json"
  //       dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  //     />
  //     <div className="min-h-screen bg-white">
  //       {/* Hero Section */}
  //       <section className="relative py-16 md:py-24 bg-white">
  //         {/* Breadcrumb - Top Left */}
  //         <div className="absolute top-6 left-6 z-10">
  //           <PageBreadcrumb items={breadcrumbItems} />
  //         </div>
  //       
  //         <div className="container mx-auto px-4 md:px-6">
  //           <div className="mt-8">
  //             <div className="text-center mb-12">
  //               <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
  //               Espace Presse <span className="text-primary">Aspeo</span>
  //               </h1>
  //               <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
  //                 Retrouvez ici l&apos;ensemble des communiqués de presse, ressources médias officielles et contacts presse Aspeo. Cet espace est destiné aux journalistes, médias et partenaires souhaitant relayer nos actualités.
  //               </p>
  //             </div>

  //             {/* Contact Presse Section */}
  //             <div className="max-w-4xl mx-auto mb-12">
  //               <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-white shadow-sm">
  //                 <CardContent className="p-6 md:p-8">
  //                   <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
  //                     <div className="flex-1">
  //                       <h2 className="text-2xl font-bold text-foreground mb-2">Contact Presse</h2>
  //                       <p className="text-muted-foreground mb-4">
  //                         Pour toute demande d&apos;information, d&apos;interview ou de visuels officiels, notre équipe presse vous répond sous 24h.
  //                       </p>
  //                       <div className="space-y-2">
  //                         <div className="flex items-center gap-2 text-sm">
  //                           <Mail className="w-4 h-4 text-primary" />
  //                           <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline font-medium">
  //                             {COMPANY.email}
  //                           </a>
  //                         </div>
  //                         <div className="flex items-center gap-2 text-sm">
  //                           <Phone className="w-4 h-4 text-primary" />
  //                           <a href={`tel:${COMPANY.phoneValue}`} className="text-primary hover:underline font-medium">
  //                             {COMPANY.phone}
  //                           </a>
  //                         </div>
  //                       </div>
  //                     </div>
  //                     <Button size="lg" className="w-full md:w-auto" asChild>
  //                       <a href="mailto:presse@aspeo.fr" className="inline-flex items-center">
  //                         Contacter le service presse
  //                         <ArrowRight className="ml-2 w-5 h-5" />
  //                       </a>
  //                     </Button>
  //                   </div>
  //                 </CardContent>
  //               </Card>
  //             </div>

  //             <PresseList initialPresse={sortedPresse} />

  //             {/* Kit Média Section */}
  //             <div className="mt-24 mb-24">
  //               <div className="text-center mb-12">
  //                 <Badge variant="outline" className="mb-4 bg-background border-border">
  //                   <FileText className="w-4 h-4 mr-2 text-primary" />
  //                   Kit Média
  //                 </Badge>
  //                 <h2 className="text-3xl font-bold">
  //                   Ressources <span className="text-primary">Médias</span>
  //                 </h2>
  //                 <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
  //                   Téléchargez nos logos, présentations et chiffres clés pour vos publications
  //                 </p>
  //               </div>

  //               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //                 {kitMediaWithSize.map((item) => (
  //                   <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
  //                     <CardHeader>
  //                       <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
  //                         <Download className="w-6 h-6 text-primary" />
  //                       </div>
  //                       <CardTitle className="text-lg">{item.title}</CardTitle>
  //                       <CardDescription>{item.description}</CardDescription>
  //                     </CardHeader>
  //                     <CardContent>
  //                       <div className="flex items-center justify-between">
  //                         <span className="text-xs text-muted-foreground">{item.fileSize}</span>
  //                         <Button size="sm" variant="outline" asChild>
  //                           <a href={item.downloadUrl} download>
  //                             <Download className="w-4 h-4 mr-2" />
  //                             Télécharger
  //                           </a>
  //                         </Button>
  //                       </div>
  //                     </CardContent>
  //                   </Card>
  //                 ))}
  //               </div>
  //             </div>

  //             {/* Apparitions Médias Section */}
  //             <div className="mt-24 mb-24">
  //               <div className="text-center mb-12">
  //                 <Badge variant="outline" className="mb-4 bg-background border-border">
  //                   <Newspaper className="w-4 h-4 mr-2 text-primary" />
  //                   Apparitions Médias
  //                 </Badge>
  //                 <h2 className="text-3xl font-bold">
  //                   Aspeo dans les <span className="text-primary">Médias</span>
  //                 </h2>
  //                 <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
  //                   Retrouvez nos interventions dans la presse, à la télévision et sur le web
  //                 </p>
  //               </div>

  //               <div className="space-y-4 max-w-4xl mx-auto">
  //                 {apparitionsMediaData.map((apparition) => (
  //                   <Card key={apparition.id} className="group hover:shadow-lg transition-all duration-300">
  //                     <CardContent className="p-6">
  //                       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  //                         <div className="flex-1">
  //                           <div className="flex items-center gap-2 mb-2">
  //                             <Badge variant="secondary" className="text-xs">
  //                               {apparition.type}
  //                             </Badge>
  //                             <span className="text-xs text-muted-foreground">
  //                               {new Date(apparition.date).toLocaleDateString('fr-FR', {
  //                                 year: 'numeric',
  //                                 month: 'long',
  //                                 day: 'numeric'
  //                               })}
  //                             </span>
  //                           </div>
  //                           <h3 className="font-bold text-lg mb-1">{apparition.title}</h3>
  //                           <p className="text-sm text-muted-foreground mb-2">{apparition.media}</p>
  //                           <p className="text-sm text-muted-foreground">{apparition.description}</p>
  //                         </div>
  //                         <Button size="sm" variant="outline" asChild>
  //                           <a href={apparition.url} target="_blank" rel="noopener noreferrer">
  //                             Voir
  //                             <ExternalLink className="w-4 h-4 ml-2" />
  //                           </a>
  //                         </Button>
  //                       </div>
  //                     </CardContent>
  //                   </Card>
  //                 ))}
  //               </div>
  //             </div>

  //             {/* Récompenses et Distinctions Section */}
  //             <div className="mt-24 mb-24">
  //               <div className="text-center mb-12">
  //                 <Badge variant="outline" className="mb-4 bg-background border-border">
  //                   <Trophy className="w-4 h-4 mr-2 text-primary" />
  //                   Récompenses & Distinctions
  //                 </Badge>
  //                 <h2 className="text-3xl font-bold">
  //                   Notre Excellence <span className="text-primary">Reconnue</span>
  //                 </h2>
  //                 <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
  //                   Les prix et certifications qui témoignent de notre engagement et de notre qualité
  //                 </p>
  //               </div>

  //               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //                 {distinctionsData.map((distinction) => (
  //                   <Card key={distinction.id} className="text-center border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
  //                     <CardContent className="p-8">
  //                       <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-primary/20 shadow-sm">
  //                         <Trophy className="w-8 h-8 text-primary" />
  //                       </div>
  //                       <h3 className="font-bold text-primary mb-2 text-lg">{distinction.title}</h3>
  //                       <p className="text-sm text-muted-foreground mb-3">{distinction.organization}</p>
  //                       <p className="text-xs text-muted-foreground mb-4">
  //                         {new Date(distinction.date).toLocaleDateString('fr-FR', {
  //                           year: 'numeric',
  //                           month: 'long'
  //                         })}
  //                       </p>
  //                       <p className="text-sm text-foreground leading-relaxed">{distinction.description}</p>
  //                     </CardContent>
  //                   </Card>
  //                 ))}
  //               </div>
  //             </div>

  //             {/* Sujets d'Expertise Section (pour les journalistes) */}
  //             <div className="mt-24 mb-24">
  //               <div className="text-center mb-12">
  //                 <Badge variant="outline" className="mb-4 bg-background border-border">
  //                   <Award className="w-4 h-4 mr-2 text-primary" />
  //                   Sujets d&apos;Expertise
  //                 </Badge>
  //                 <h2 className="text-3xl font-bold">Nos domaines de <span className="text-primary">Prise de Parole</span></h2>
  //                 <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
  //                    Aspeo apporte son expertise sur les enjeux majeurs du secteur de la propreté et des services aux entreprises.
  //                 </p>
  //               </div>
  //               
  //               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
  //                  {[
  //                    { title: 'Éco-responsabilité', desc: 'Transition vers le nettoyage 100% sans chimie et impact environnemental.', icon: Leaf },
  //                    { title: 'Protocoles Sanitaires', desc: 'Expertise sur les normes d\'hygiène en milieu sensible (santé, bureaux).', icon: ShieldCheck },
  //                    { title: 'Qualité & RSE', desc: 'Comment nous concilions excellence opérationnelle et engagement sociétal.', icon: TrendingUp },
  //                    { title: 'Métiers du Service', desc: 'Valorisation des agents de propreté et enjeux de recrutement.', icon: Users },
  //                    { title: 'Entrepreneuriat', desc: 'Croissance d\'une entreprise de service sur le plan national.', icon: Award },
  //                    { title: 'Hygiène de Demain', desc: 'Tendances et innovations technologiques dans le secteur.', icon: Newspaper }
  //                  ].map((topic, i) => (
  //                    <Card key={i} className="text-center border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
  //                      <CardContent className="p-8">
  //                        <div className="w-16 h-16 bg-card rounded-full mx-auto mb-6 flex items-center justify-center border border-border shadow-sm">
  //                          <topic.icon className="w-8 h-8 text-primary" />
  //                        </div>
  //                        <h3 className="font-bold text-primary mb-4 text-xl">{topic.title}</h3>
  //                        <p className="text-muted-foreground text-sm leading-relaxed">{topic.desc}</p>
  //                      </CardContent>
  //                    </Card>
  //                  ))}
  //               </div>
  //             </div>

  //           {/* L'Impact Aspeo en Chiffres Section */}
  //           <div className="">
  //             <div className="text-center mb-16">
  //               <Badge variant="outline" className="mb-4 bg-background border-border">
  //                 <TrendingUp className="w-4 h-4 mr-2 text-primary" />
  //                 Performance & Croissance
  //               </Badge>
  //               <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
  //                 L&apos;Impact Aspeo en <span className="text-primary">Chiffres</span>
  //               </h2>
  //               <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
  //                 Une croissance constante et un engagement qualité sans faille au service de nos clients.
  //               </p>
  //             </div>

  //             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
  //               <div className="text-center space-y-2 p-8 rounded-2xl bg-card border border-border shadow-sm">
  //                 <div className="text-5xl font-bold text-foreground">
  //                   <NumberTicker value={30} />
  //                   <span className="text-primary text-2xl ml-1">+</span>
  //                 </div>
  //                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Clients satisfaits</p>
  //               </div>

  //               <div className="text-center space-y-2 p-8 rounded-2xl bg-card border border-border shadow-sm">
  //                 <div className="text-5xl font-bold text-foreground">
  //                   <NumberTicker value={100} />
  //                   <span className="text-primary text-2xl ml-1">%</span>
  //                 </div>
  //                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Satisfaction</p>
  //               </div>

  //               <div className="text-center space-y-2 p-8 rounded-2xl bg-card border border-border shadow-sm">
  //                 <div className="text-5xl font-bold text-foreground">
  //                   <NumberTicker value={4} />
  //                   <span className="text-primary text-2xl ml-1">+</span>
  //                 </div>
  //                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Années d&apos;expertise</p>
  //               </div>
  //             </div>
  //           </div>
  //           </div>
  //         </div>
  //       </section>

  //       {/* CTA Section */}
  //       <section className="py-20 bg-primary text-white">
  //         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
  //           <div className="max-w-4xl mx-auto text-center">
  //             <h2 className="text-3xl md:text-4xl font-bold mb-6">
  //               Prêt à découvrir la différence Aspeo ?
  //             </h2>
  //             <p className="text-xl mb-8 text-white/90">
  //               Rejoignez plus de 150 clients qui nous font confiance pour maintenir 
  //               leurs espaces dans un état parfait.
  //             </p>
  //             
  //             <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
  //               <Button size="lg" variant="secondary" className="group" asChild>
  //                 <Link href="/contact#contact-form" className="inline-flex items-center">
  //                   Demander un devis gratuit
  //                   <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
  //                 </Link>
  //               </Button>
  //               <Button size="lg" variant="outline" asChild className="text-foreground">
  //                 <Link href={`tel:${COMPANY.phoneValue}`} className="inline-flex items-center">
  //                   <Phone className="mr-2 w-5 h-5" />
  //                   Nous appeler
  //                 </Link>
  //               </Button>
  //             </div>

  //             <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-white/80">
  //               <div className="flex items-center">
  //                 <MapPin className="w-5 h-5 mr-2" />
  //                 <span>Intervention en Loire et Rhône</span>
  //               </div>
  //               <div className="flex items-center">
  //                 <Clock className="w-5 h-5 mr-2" />
  //                 <span>Réponse sous 24h garantie</span>
  //               </div>
  //               <div className="flex items-center">
  //                 <ShieldCheck className="w-5 h-5 mr-2" />
  //                 <span>Devis gratuit et sans engagement</span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </section>
  //     </div>
  //   </div>
  // );
};

export default PressePage;
