import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Clock, Sparkles } from 'lucide-react';

interface ComingSoonPageProps {
  feature: string;
  description: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ feature, description }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {feature}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Clock className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We're working hard to bring you this feature. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage;