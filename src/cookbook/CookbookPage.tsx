import { DocumentTitle, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Content,
  JumpLinks,
  JumpLinksItem,
  Label,
  PageSection,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Title,
} from '@patternfly/react-core';
import { useCallback, useState, type FC } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom-v5-compat';
import { cookbookCards } from '../data/cards';
import { ALL_NAMESPACES_KEY } from '../data/namespace';
import { cookbookContent } from './content';
import { CommandBlock, type CommandResult } from './CommandBlock';
import { getKinds } from '../data/kinds';
import { sectionId } from './types';
import RouterBridge from '../components/RouterBridge';

import './cookbook.css';

const CookbookPageContent: FC = () => {
  const { t } = useTranslation('plugin__partner-labs-console-plugin');
  const { demoId } = useParams<{ demoId: string }>();
  const location = useLocation();
  // Console 4.19–4.21 routes are registered by the v5 host, outside a v6 Route.
  const cardId = demoId ?? /\/partner-labs-demos\/([^/]+)\/?$/.exec(location.pathname)?.[1];
  const [activeNamespace] = useActiveNamespace();
  const kinds = getKinds(t, activeNamespace);
  const [results, setResults] = useState<Record<string, CommandResult>>({});

  const card = cookbookCards.find((c) => c.id === cardId);
  const sections = card ? cookbookContent[card.id] : undefined;

  const setCommandResult = useCallback((commandId: string) => {
    return (result: CommandResult) => {
      setResults((prev) => ({ ...prev, [commandId]: result }));
    };
  }, []);

  if (!card || !sections) {
    return (
      <PageSection>
        <Alert variant="warning" title={t('Demo not found')} />
      </PageSection>
    );
  }

  return (
    <>
      <DocumentTitle>{card.title}</DocumentTitle>
      <PageSection>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/partner-labs-demos" data-test="back-to-demos">
              {t('Partner Labs Demos')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{card.title}</BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" size="2xl" className="partner-labs-console-plugin__cookbook-title">
          {card.title}
        </Title>
        <div className="partner-labs-console-plugin__cookbook-labels">
          <Label>
            {activeNamespace === ALL_NAMESPACES_KEY
              ? t('All projects')
              : t('Namespace: {{ns}}', { ns: activeNamespace })}
          </Label>
          <Label color={kinds[card.kind].color}>{kinds[card.kind].label}</Label>
        </div>
        <Sidebar hasGutter>
          <SidebarPanel
            width={{ default: 'width_25' }}
            variant="sticky"
            className="partner-labs-console-plugin__cookbook-toc"
            data-test="cookbook-toc"
          >
            <JumpLinks
              isVertical
              expandable={{ default: 'expandable', md: 'nonExpandable' }}
              scrollableSelector="#content-scrollable"
              label={t('On this page')}
              aria-label={t('On this page')}
            >
              {sections.map((section, index) => (
                <JumpLinksItem
                  key={sectionId(section.heading, index)}
                  href={`#${sectionId(section.heading, index)}`}
                  data-test={`jump-${sectionId(section.heading, index)}`}
                  onClick={() => {
                    document.getElementById(sectionId(section.heading, index))?.scrollIntoView({
                      block: 'start',
                    });
                  }}
                >
                  {section.heading}
                </JumpLinksItem>
              ))}
            </JumpLinks>
          </SidebarPanel>
          <SidebarContent>
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="partner-labs-console-plugin__cookbook-section">
                <Title
                  headingLevel={section.level === 2 ? 'h2' : 'h3'}
                  size={section.level === 2 ? 'xl' : 'lg'}
                  id={sectionId(section.heading, sectionIdx)}
                  className="partner-labs-console-plugin__cookbook-heading"
                  tabIndex={-1}
                >
                  {section.heading}
                </Title>

                {section.content.map((block, blockIdx) => {
                  const key = `${String(sectionIdx)}-${String(blockIdx)}`;
                  if (block.type === 'text') {
                    return (
                      <Content component="p" key={key}>
                        {block.value}
                      </Content>
                    );
                  }
                  if (block.type === 'steps') {
                    return (
                      <Content component="ol" key={key}>
                        {block.items.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </Content>
                    );
                  }
                  if (block.type === 'command') {
                    return (
                      <CommandBlock
                        key={key}
                        command={block.value}
                        action={block.action}
                        namespace={activeNamespace}
                        result={results[key] ?? { status: 'idle' }}
                        onResult={setCommandResult(key)}
                      />
                    );
                  }
                  if (block.type === 'video') {
                    return (
                      <div key={key} className="partner-labs-console-plugin__video-wrapper">
                        <iframe
                          src={block.src}
                          title={block.title ?? t('Video')}
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        />
                      </div>
                    );
                  }
                  return (
                    <Alert
                      key={key}
                      variant={block.variant === 'warning' ? 'warning' : 'info'}
                      isInline
                      title={block.value}
                      className="partner-labs-console-plugin__cookbook-note"
                    />
                  );
                })}
              </div>
            ))}
          </SidebarContent>
        </Sidebar>
      </PageSection>
    </>
  );
};

const CookbookPage: FC = () => (
  <RouterBridge>
    <CookbookPageContent />
  </RouterBridge>
);

export default CookbookPage;
